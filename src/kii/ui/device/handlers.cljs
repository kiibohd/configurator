(ns kii.ui.device.handlers
  (:require [re-frame.core :as rf]
            [kii.env :as env]
            [kii.ui.util :as u]))

(rf/reg-event-db :device/successful-watch (fn [db _] db))

(defn success-update-devices
  [db _]
  (assoc db :usb/polled? true))

(rf/reg-event-db :device/successful-update success-update-devices)

