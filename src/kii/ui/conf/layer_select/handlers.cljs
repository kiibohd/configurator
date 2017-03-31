(ns kii.ui.conf.layer-select.handlers
  (:require [re-frame.core :as rf]))

(defn set-active-layer
  [db [_ value]]
  (assoc-in db [:conf :active-layer] value))

(rf/reg-event-db :set-active-layer set-active-layer)