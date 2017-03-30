(ns kii.ui.handlers
  (:require [re-frame.core :as rf]
            [kii.ui.db :as db]
            [kii.ui.alert.handlers]
            [kii.ui.device.handlers]
            [kii.ui.usb.handlers]
            [kii.ui.base.handlers]
            [kii.ui.conf.handlers]))

(defn initialize [_ _]
  db/default-db)

(rf/reg-event-db :initialize initialize)

(rf/reg-event-fx
  :boot
  (fn [_ _]
    {:db db/default-db
     :usb/watch nil
     :usb/poll nil}))
