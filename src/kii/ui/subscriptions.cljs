(ns kii.ui.subscriptions
  (:require [kii.ui.conf.subscriptions]
            [kii.ui.device.subscriptions]
            [kii.ui.alert.subscriptions]
            [re-frame.core :as rf]))

(rf/reg-sub
 :initialized?
 (fn  [db _]
   (and (not (empty? db))
        (:usb/polled? db)
        )))

(rf/reg-sub
 :layout/active
 (fn [db _]
   (:active-layout db)))

(rf/reg-sub
 :panel/active
 (fn [db _]
   (:active-panel db)))

