(ns kii.ui.conf.config-tabs.handlers
  (:require [re-frame.core :as rf]))

(defn set-active-layer
  [db [_ value]]
  (assoc-in db [:conf :active-config-tab] value))

(rf/reg-event-db :conf/set-active-config-tab set-active-layer)