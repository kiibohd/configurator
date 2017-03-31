(ns kii.ui.conf.key-group.handlers
  (:require [re-frame.core :as rf]))

(rf/reg-event-db
  :toggle-key-group-state
  (fn [db [_ group]]
    (update-in db
               [:conf :key-group-states group]
               (fnil #(if (= :visible %) :hidden :visible) :visible))))