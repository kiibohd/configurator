(ns kii.ui.base.handlers
  (:require [re-frame.core :as rf]
    ;;[kii.ui.conf.handlers]
            [kii.device.keyboard :as keyboard]))

(defn set-active-panel [db [_ value]]
  (assoc db :active-panel value))

(rf/reg-event-db :set-active-panel set-active-panel)

(defn set-active-layout
  [db [_ layout]]
  (assoc db :active-layout layout))

(rf/reg-event-db :set-active-layout set-active-layout)


;; TODO: Move to device
(defn filter-device
  [devices path]
  (filterv #(not= path (:path %)) devices))

(defn add-device [db [_ device]]
  (let [devices (:devices db)
        without (filter-device devices (:path device))]
    (if (keyboard/ic? device)
      (assoc db :devices (conj without device))
      db)))

(rf/reg-event-db :add-device add-device)

(defn remove-device [db [_ device]]
  (let [devices (seq (:devices db))
        without (filter-device devices (:path device))]
    (assoc db :devices without)))

(rf/reg-event-db :remove-device remove-device)

(defn set-active-device
  [db [_ device]]
  (assoc db :active-keyboard device))

(rf/reg-event-db :set-active-device set-active-device)


;; TODO: Move to alerts
(defn add-alert
  [db [_ alert]]
  (let [alerts (vec (:alerts db))]
    (if (some #{alert} alerts)
      db
      (assoc db :alerts (conj alerts alert)))))

(rf/reg-event-db :add-alert add-alert)

(defn remove-alert
  [db [_ alert]]
  (let [alerts (vec (:alerts db))]
    (assoc db :alerts (filterv (complement #{alert}) alerts))))

(rf/reg-event-db :remove-alert remove-alert)