(ns kii.bindings.electron-main)

(defonce electron (js/require "electron"))
(def ipc (.-ipcMain electron))
(def shell (.-shell electron))
(def app            (.-app electron))
(def BrowserWindow (.-BrowserWindow electron))
(def crash-reporter (.-crashReporter electron))
