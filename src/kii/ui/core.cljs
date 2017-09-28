(ns kii.ui.core
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [kii.env :as env]
            [kii.test.runner]
            [kii.ui.util :as u]
            [kii.ui.browser]
            [kii.ui.subscriptions]
            [kii.ui.base.components]
            [kii.ui.handlers])
  )

(defn mount-root []
  (r/render
    [kii.ui.base.components/base-layout]
    (js/document.getElementById "container"))
  )

(defn ^:export full-init []
  (rf/dispatch [:boot])
  (mount-root)
  (kii.ui.browser/register-keypress-events))

(defn init []
  (enable-console-print!)
  (print "Refreshed.")
  (kii.test.runner/run)
  (full-init))

(defonce root
  (full-init))