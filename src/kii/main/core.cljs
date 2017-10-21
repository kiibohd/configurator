(ns kii.main.core
  (:require [kii.env :as env]
            [kii.bindings.electron-main :as electron]
            [kii.main.menu :as menu]))

(def electron-dl    (js/require "electron-dl"))

(enable-console-print!)

(def main-window (atom nil))

(defn load-page [window]
  (.loadURL window (str "file://" (.getAppPath electron/app) "/index.html")))

(defn init-browser []
  (reset! main-window (electron/BrowserWindow.
                        (clj->js
                          {:width  1280
                           :height 920
                           :icon (str (.getAppPath electron/app) "/img/ic-logo-64x64.png")})))
  (load-page @main-window)
  (menu/build-menu @main-window)
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
  (.on electron/app "window-all-closed" #(when-not (= js/process.platform "darwin") (.quit electron/app)))
  (.on electron/app "ready" init-browser)
  (set! *main-cli-fn* (fn [] nil)))

;; TODO: Move to kii.bindings.electron-renderer and use core.async
(defn send-to-renderer
  [e msg arg]
  (let [sender (.-sender e)]
    (.send sender msg arg)))

(defn dl-file
  [e url]
  (let [focused (.getFocusedWindow electron/BrowserWindow)
        promise (.download electron-dl focused url)
        notify #(send-to-renderer e "download-complete" %)]
    (.then promise #(notify #js {:status "success" :path (.getSavePath %)}))
    (.catch promise #(notify #js {:status "error" :error %}))))

(.on electron/ipc "download-file" dl-file)
