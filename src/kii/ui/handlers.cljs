(ns kii.ui.handlers
  (:require [re-frame.core :as rf]
            [kii.ui.db :as db]
            [kii.ui.usb.handlers]
            [kii.ui.base.handlers]
            [kii.ui.conf.handlers]
            [kii.ui.device.handlers]))

(defn initialize [_ _]
  db/default-db)

(rf/reg-event-db :initialize initialize)

(rf/reg-event-fx
  :boot
  (fn [_ _]
    {:db db/default-db
     :usb/watch nil
     :usb/poll nil}))
