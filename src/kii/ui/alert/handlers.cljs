(ns kii.ui.alert.handlers
  (:require [re-frame.core :as rf]))

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

(rf/reg-event-db :alert/remove-all
  (fn [db _]
    (assoc db :alerts [])))