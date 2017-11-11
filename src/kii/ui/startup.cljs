(ns kii.ui.startup
  (:require [cljsjs.material-ui]  ;; Needs to load before react/reagent
            [cljsjs.react]
            [reagent.core :as r]
            [re-frame.core :as rf]
            [kii.ui.config]
            [kii.ui.core]
            [kii.ui.browser]
            [kii.test.runner]
            [kii.env :as env]
            [kii.ui.components.core]
            [kii.ui.components.home :refer [home]]
            [kii.ui.conf.components.main]
            [kii.bindings.electron-renderer :as electron]
            [taoensso.timbre :as timbre :refer-macros [log logf]]))

(defn mount-root
  "Called once at the beginning of the application to attach reagent/react
  to the root `container` element on the DOM."
  []
  (r/render
    [home]
    (js/document.getElementById "container"))
  )

(when env/dev?
  (defn dev-reload
    "Called everytime the UI is live-reloaded during development"
    []
    (log :info "Refreshed.")
    (kii.test.runner/run)))

(defn ^:export init
  "UI Entry Point"
  []
  (enable-console-print!)
  ;; Version check:
  ;;https://developer.github.com/v3/repos/releases/
  ;;https://developer.github.com/v3/
  (logf :info "Loading v%s" electron/app-version)
  (when env/dev? (dev-reload))
  (rf/dispatch [:boot])
  (mount-root)
  ;; TODO - This should probably be moved out of the startup logic.
  (kii.ui.browser/register-keypress-events))
