(ns kii.ui.conf.keyboard.subscriptions
  (:require [re-frame.core :as rf]))

(defn get-selected-key
  [db _]
  (-> db :conf :selected-key))

(rf/reg-sub :conf/selected-key get-selected-key)