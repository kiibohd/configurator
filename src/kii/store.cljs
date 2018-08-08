(ns kii.store
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [taoensso.timbre :as timbre :refer-macros [log logf]]
            [cljs.core.async :refer [chan <! >! put! close!]]
            [kii.bindings.cljsjs :refer [jszip]]
            [kii.macros :refer-macros [<? go-try p->chan cb->chan]]
            [kii.bindings.node.fs :as fs]
            [kii.bindings.node.path :as path]
            [kii.bindings.electron-renderer :refer [user-data-dir]]
            [kii.util :as util]
            [cuerdas.core :as str]
            [cljs-time.core :as time]
            [cljs-time.coerce :as time-coerce]))

(def log-file "log/build.log")
(def bin-file "kiibohd.dfu.bin")
(def cache-dir "firmware-cache")
(def util-dir "utils")

(defn cache-firmware
  [zip-file]
  (let [c (chan)]
    (go
     (try
       (let [extract (fn [zip path] (p->chan (-> zip (.file path) (.async "nodebuffer"))))
             filename (-> zip-file path/parse :name)
             [_ board layout hash failure?] (first (re-seq #"^([A-Za-z0-9_\.-]+)-([A-Za-z0-9_\.-]+)-([0-9A-Fa-f]{32})(_error)?" filename))
             out-dir (path/join user-data-dir cache-dir filename)
             bin-out (path/join out-dir bin-file)
             _ (<? (fs/mkdirp out-dir))
             file (<? (fs/read-file zip-file))
             zip (<? (p->chan (.loadAsync jszip file)))
             json-name (str/fmt "%s-%s.json" board layout)
             json-out (path/join out-dir json-name)
             json-data (<? (extract zip json-name))
             log-data (<? (extract zip log-file))
             log-out (path/join out-dir "build.log")]
         (case board
           "MDErgo1" (let [left-data (<? (extract zip (str "left_" bin-file)))
                           right-data(<? (extract zip (str "right_" bin-file)))
                           left-out (path/join out-dir (str "left_" bin-file))
                           right-out (path/join out-dir (str "right_" bin-file))
                           data {:board  board
                                 :layout layout
                                 :result (if failure? :error :success)
                                 :hash   hash
                                 :bin    {:left left-out  :right right-out}
                                 :json   json-out
                                 :log    log-out
                                 :time   (time-coerce/to-long (time/now))}]
                       (when-not failure?
                         (do (fs/write-file! left-out left-data)
                             (fs/write-file! right-out right-data)))
                       (fs/write-file! json-out json-data)
                       (fs/write-file! log-out log-data)

                       (logf :info "Successfully extracted firmware and config to local cache: %s" data)
                       (put! c data))
           ;; Default Handler
           (let [bin-data (when-not failure? (<? (extract zip bin-file)))
                 data {:board  board
                       :layout layout
                       :result (if failure? :error :success)
                       :hash   hash
                       :bin    bin-out
                       :json   json-out
                       :log    log-out
                       :time   (time-coerce/to-long (time/now))}]
             (when-not failure? (fs/write-file! bin-out bin-data))
             (fs/write-file! json-out json-data)
             (fs/write-file! log-out log-data)

             (logf :info "Successfully extracted firmware and config to local cache: %s" data)

             (put! c data))))
       (catch js/Error e
         (logf :error e "Error extracting firmware"))))
    c))

(defn dfu-util-installed?
  [version]
  (let [store-dir (path/join user-data-dir util-dir (str "dfu-util_v" version))]
    (fs/directory-exists! store-dir)))

(defn store-dfu-util
  [zip-file version]
  (let [store-dir (path/join user-data-dir util-dir (str "dfu-util_v" version))
        c (chan)]
    (go
      (try
        (let [extract (fn [zip path] (p->chan (-> zip (.file path) (.async "nodebuffer"))))
              file (<? (fs/read-file zip-file))
              zip (<? (p->chan (.loadAsync jszip file)))

              ]
          (let [files (util/js->clj-own (.-files zip))]
            (fs/mkdirp store-dir)
            (loop [filepaths (keys files)]
              (if-let [filepath (first filepaths)]
                (do
                  (when-not (.-dir (get files filepath))
                    (let [data (<? (extract zip filepath))
                          filename (-> filepath path/parse :base)
                          outpath (path/join store-dir filename)]
                      (fs/write-file! outpath data)
                      (when (and (= filename "dfu-util") (not= "win32" js/process.platform))
                        (fs/chmod! outpath "755"))
                      ))
                  (recur (rest filepaths)))
                (put! c (path/join store-dir "dfu-util"))
                )))
          )
        (catch js/Error e
          (logf :error e "Error extracting dfu-util"))))
    c))
(defn zadic-installed?
  [version]
  (let [store-dir (path/join user-data-dir util-dir (str "zadic_v" version))]
    (fs/directory-exists! store-dir)))

(defn store-zadic
  [exe-file version config]
  (let [c (chan)]
    (go
      (let [store-dir (path/join user-data-dir util-dir (str "zadic_v" version))
            dst (path/join store-dir "kiidrv.exe")
            dst-config (path/join store-dir "kiibohd.conf")]
        (fs/mkdirp store-dir)
        (let [_ (<? (fs/copy-file exe-file dst))
              _ (<? (fs/write-file dst-config config))]
          (put! c dst))
        )
      )
    c
    )
  )
