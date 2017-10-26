(ns kii.store
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [taoensso.timbre :as timbre :refer-macros [log logf]]
            [cljs.core.async :refer [chan <! >! put! close!]]
            [kii.bindings.cljsjs :refer [jszip]]
            [kii.macros :refer-macros [<? go-try p->chan cb->chan]]
            [kii.bindings.node.fs :as fs]
            [kii.bindings.node.path :as path]
            [kii.bindings.electron-renderer :refer [user-data-dir]]
            ))

(def bin-file "kiibohd.dfu.bin")
(def cache-dir "firmware-cache")

;; TODO - Parse Filename
(defn cache-firmware
  [zip-file]
  (let [c (chan)]
    (go
      (try
        (let [out-dir (path/join user-data-dir cache-dir (-> zip-file path/parse :name))
              bin-out (path/join out-dir bin-file)
              _ (<? (fs/mkdirp out-dir))
              file (<? (fs/read-file zip-file))
              zip (<? (p->chan (.loadAsync jszip file)))
              data (<? (p->chan (-> zip (.file bin-file) (.async "nodebuffer"))))
              ]
          (fs/write-file! bin-out data)
          (logf :info "Successfully extracted firmware to local cache: %s" bin-out)

          (put! c bin-out)
          )
        (catch js/Error e
          (logf :error e "Error extracting firmware")))
      )
    c)
  )
