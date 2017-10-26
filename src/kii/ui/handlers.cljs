(ns kii.ui.handlers
  (:require [re-frame.core :as rf]
            [kii.ui.db :as db]
            [kii.ui.alert.handlers]
            [kii.ui.device.handlers]
            [kii.ui.usb.handlers]
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

;; Base Components

(defn set-active-panel [db [_ value]]
  (assoc db :active-panel value))

(rf/reg-event-db :panel/set-active set-active-panel)

(defn set-active-layout
  [db [_ layout]]
  (assoc db :active-layout layout))

(rf/reg-event-db :layout/set-active set-active-layout)
