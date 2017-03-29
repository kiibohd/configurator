(ns kii.ui.handlers
  (:require [re-frame.core :as rf]
            [kii.ui.db :as db]
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

;; TODO Move out
(rf/reg-event-db :success-watch-devices (fn [db _] db))

;; TODO Move out.
(defn success-update-devices
  [db _]
  (assoc db :usb/polled? true))

(rf/reg-event-db :success-update-devices success-update-devices)