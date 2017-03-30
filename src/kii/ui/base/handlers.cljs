(ns kii.ui.base.handlers
  (:require [re-frame.core :as rf]))

(defn set-active-panel [db [_ value]]
  (assoc db :active-panel value))

(rf/reg-event-db :panel/set-active set-active-panel)

(defn set-active-layout
  [db [_ layout]]
  (assoc db :active-layout layout))

(rf/reg-event-db :layout/set-active set-active-layout)


;; TODO: Move to alerts
(defn add-alert
  [db [_ alert]]
  (let [alerts (vec (:alerts db))]
    (if (some #{alert} alerts)
      db
      (assoc db :alerts (conj alerts alert)))))

(rf/reg-event-db :alert/add add-alert)

(defn remove-alert
  [db [_ alert]]
  (let [alerts (vec (:alerts db))]
    (assoc db :alerts (filterv (complement #{alert}) alerts))))

(rf/reg-event-db :alert/remove remove-alert)