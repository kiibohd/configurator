(ns kii.ui.core
  (:require [cljsjs.material-ui]
            [reagent.core :as r]
            [re-frame.core :as rf]
            [kii.env :as env]
            [kii.ui.subscriptions]
            [kii.ui.handlers]
            [kii.ui.conf.components]
            ;[kii.ui.startup]
            ))

;(if env/dev?
;  ;; Re-exposed here for debugging purposes
;  (def init-dev kii.ui.startup/init-dev))
;
;(def ^:export init #'kii.ui.startup/init)

