(ns kii.ui.base.subscriptions
  (:require [re-frame.core :as rf]))

(rf/reg-sub
  :initialized?
  (fn  [db _]
    (and (not (empty? db))
         ;;(vector? (:devices db))
         (:usb/polled? db)
         )))

(rf/reg-sub
  :device/active
  (fn [db _]
    (:active-keyboard db)))

(rf/reg-sub
  :layout/active
  (fn [db _]
    (:active-layout db)))

(rf/reg-sub
  :panel/active
  (fn [db _]
    (:active-panel db)))

(rf/reg-sub
  :alert/all
  (fn [db _]
    (:alerts db)))
