(ns kii.main.core
  (:require [kii.env :as env]))

(def electron       (js/require "electron"))
(def app            (.-app electron))
(def browser-window (.-BrowserWindow electron))
(def crash-reporter (.-crashReporter electron))
(def ipc            (.-ipcMain electron))
(def electron-dl    (js/require "electron-dl"))

(enable-console-print!)

(def main-window (atom nil))

(defn load-page [window]
  (.loadURL window (str "file://" (.getAppPath app) "/index.html")))

(defn init-browser []
  (reset! main-window (browser-window.
                        #js {:width 1280
                             :height 920}))
  (load-page @main-window)
  (if env/dev? (.openDevTools @main-window))
  (.on @main-window "closed" #(reset! main-window nil)))

; CrashReporter can just be omitted
#_(.start crash-reporter
          (clj->js
            {:companyName "MyAwesomeCompany"
             :productName "MyAwesomeApp"
             :submitURL "https://example.com/submit-url"
             :autoSubmit false}))

(defn init []
  (.on app "window-all-closed" #(when-not (= js/process.platform "darwin") (.quit app)))
  (.on app "ready" init-browser)
  (set! *main-cli-fn* (fn [] nil)))

;; TODO: Move to kii.bindings.electron-renderer and use core.async
(defn send-to-renderer
  [e msg arg]
  (let [sender (.-sender e)]
    (.send sender msg arg)))

(defn dl-file
  [e url]
  (let [focused (.getFocusedWindow browser-window)
        promise (.download electron-dl focused url)
        notify #(send-to-renderer e "download-complete" %)]
    (.then promise #(notify #js {:status "success" :path (.getSavePath %)}))
    (.catch promise #(notify #js {:status "error" :error %}))))

(.on ipc "download-file" dl-file)
