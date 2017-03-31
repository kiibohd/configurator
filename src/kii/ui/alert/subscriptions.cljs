(ns kii.ui.alert.subscriptions
  (:require [re-frame.core :as rf]))

(rf/reg-sub
  :alert/all
  (fn [db _]
    (:alerts db)))