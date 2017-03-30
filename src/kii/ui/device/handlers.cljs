(ns kii.ui.device.handlers
  (:require [re-frame.core :as rf]
            [kii.env :as env]
            [kii.ui.util :as u]
            [kii.device.keyboard :as keyboard]))

(rf/reg-event-db :device/successful-watch (fn [db _] db))

(defn success-update-devices
  [db _]
  (assoc db :usb/polled? true))

(rf/reg-event-db :device/successful-update success-update-devices)

(defn filter-device
  [devices path]
  (filterv #(not= path (:path %)) devices))

(defn add-device [db [_ device]]
  (let [devices (:devices db)
        without (filter-device devices (:path device))]
    (if (keyboard/ic? device)
      (assoc db :devices (conj without device))
      db)))

(rf/reg-event-db :device/add add-device)

(defn remove-device [db [_ device]]
  (let [devices (seq (:devices db))
        without (filter-device devices (:path device))]
    (assoc db :devices without)))

(rf/reg-event-db :device/remove remove-device)

(defn set-active-device
  [db [_ device]]
  (assoc db :active-keyboard device))

(rf/reg-event-db :device/set-active set-active-device)
