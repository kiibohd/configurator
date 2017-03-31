(ns kii.ui.conf.actions.subscriptions
  (:require [re-frame.core :as rf]))

(defn get-current-actions
  [db _]
  (or (-> db :conf :current-actions) #{}))

(rf/reg-sub :conf/current-actions get-current-actions)