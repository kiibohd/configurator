(ns kii.ui.base.subscriptions
  (:require [re-frame.core :as rf]))

(rf/reg-sub
  :initialized?
  (fn  [db _]
    (and (not (empty? db))
         (vector? (:devices db)))))

(rf/reg-sub
  :device/active
  (fn [db _]
    (:active-keyboard db)))

(rf/reg-sub
  :active-layout
  (fn [db _]
    (:active-layout db)))

(rf/reg-sub
  :active-panel
  (fn [db _]
    (:active-panel db)))

(rf/reg-sub
  :alert/all
  (fn [db _]
    (:alerts db)))
