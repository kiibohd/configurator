(ns kii.store
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [taoensso.timbre :as timbre :refer-macros [log logf]]
            [cljs.core.async :refer [chan <! >! put! close!]]
            [kii.bindings.cljsjs :refer [jszip]]
            [kii.macros :refer-macros [<? go-try p->chan cb->chan]]
            [kii.bindings.node.fs :as fs]
            [kii.bindings.node.path :as path]
            [kii.bindings.electron-renderer :refer [user-data-dir]]
            [cuerdas.core :as str]
            [cljs-time.core :as time]
            [cljs-time.coerce :as time-coerce]))

(def log-file "log/build.log")
(def bin-file "kiibohd.dfu.bin")
(def cache-dir "firmware-cache")

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
