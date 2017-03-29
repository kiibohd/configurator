(ns kii.bindings.electron-main)

(defonce electron (js/require "electron"))
(def ipc (.-ipcMain electron))

