(ns kii.store
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [taoensso.timbre :as timbre :refer-macros [log logf]]
            [cljs.core.async :refer [chan <! >! put! close!]]
            [kii.bindings.cljsjs :refer [jszip]]
            [kii.macros :refer-macros [<? go-try p->chan cb->chan]]
            [kii.bindings.node.fs :as fs]
            [kii.bindings.node.path :as path]
            [kii.bindings.electron-renderer :refer [user-data-dir]]
            [cuerdas.core :as str]))

(def bin-file "kiibohd.dfu.bin")
(def cache-dir "firmware-cache")

(defn cache-firmware
  [zip-file]
  (let [c (chan)]
    (go
      (try
        (let [extract (fn [zip path] (p->chan (-> zip (.file path) (.async "nodebuffer"))) )
              filename (-> zip-file path/parse :name)
              [_ board layout hash] (first (re-seq #"^([A-Za-z0-9_-]+)-([A-Za-z0-9_]+)-([0-9A-Fa-f]{32})" filename))
              out-dir (path/join user-data-dir cache-dir filename)
              bin-out (path/join out-dir bin-file)
              _ (<? (fs/mkdirp out-dir))
              file (<? (fs/read-file zip-file))
              zip (<? (p->chan (.loadAsync jszip file)))
              json-name (str/fmt "%s-%s.json" board layout)
              bin-data (<? (extract zip bin-file))
              json-data (<? (extract zip json-name)) ]
          (fs/write-file! bin-out bin-data)
          (fs/write-file! (path/join out-dir json-name) json-data)

          (logf :info "Successfully extracted firmware and config to local cache: %s" bin-out)

          (put! c bin-out)
          )
        (catch js/Error e
          (logf :error e "Error extracting firmware"))))
    c))
