(ns kii.ui.conf.key-group.subscriptions
  (:require [re-frame.core :as rf]))

(defn get-key-group-state
  [db [_ group]]
  (or (-> db :conf :key-group-states group) :visible))

(rf/reg-sub :conf/key-group-state get-key-group-state)