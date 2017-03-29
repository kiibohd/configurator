(ns kii.bindings.electron-renderer)

(defonce electron (js/require "electron"))
(def ipc (.-ipcRenderer electron))

(defn send-to-main [event]
  (.send ipc (:name event) (:arg event)))

(defn on-msg-from-main [msg f]
  (.on ipc msg f))
