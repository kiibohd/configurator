(ns kii.ui.startup
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [kii.ui.core]
            [kii.ui.browser]
            [kii.test.runner]
            [kii.env :as env]
            [kii.ui.components :as comp]))

(defn mount-root []
  (r/render
    [comp/base-layout]
    (js/document.getElementById "container"))
  )

(when env/dev?
  (defn dev-reload []
    ;(enable-console-print!)
    (print "Refreshed.")
    (kii.test.runner/run)))

(defn init
  []
  (enable-console-print!)
  (when env/dev? (dev-reload))
  (rf/dispatch [:boot])
  (mount-root)
  (kii.ui.browser/register-keypress-events)
  )
