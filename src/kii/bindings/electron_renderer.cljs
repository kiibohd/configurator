(ns kii.bindings.electron-renderer)

(defonce electron (js/require "electron"))
(defonce child-process (js/require "child_process"))
(def remote (.-remote electron))
(def ipc (.-ipcRenderer electron))
(def shell (.-shell electron))
(def dialog (.-dialog remote))
(def app (.-app remote))

(def user-data-dir (.getPath app "userData"))

(defn send-to-main [event]
  (.send ipc (:name event) (:arg event)))

(defn on-msg-from-main [msg f]
  (.on ipc msg f))

(def app-version (.getVersion app))