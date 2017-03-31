(ns kii.ui.device.subscriptions
  (:require [re-frame.core :as rf]))

(rf/reg-sub
  :device/all
  (fn [db _]
    (:devices db)))

(rf/reg-sub
  :device/active
  (fn [db _]
    (:active-keyboard db)))