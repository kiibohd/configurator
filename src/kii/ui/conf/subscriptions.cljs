(ns kii.ui.conf.subscriptions
  (:require [re-frame.core :as rf]))

(defn get-cfg
  [db _]
  (:cfg db))

(rf/reg-sub :cfg get-cfg)

(defn get-active-layer
  [db _]
  (or (-> db :cfg :active-layer) 0))

(rf/reg-sub :cfg-active-layer get-active-layer)

(defn loaded?
  [db _]
  (-> db :cfg :loaded?))

(rf/reg-sub :cfg-loaded? loaded?)

(defn get-defines
  [db _]
  (-> db :cfg :kll :header))

(rf/reg-sub :cfg-defines get-defines)

(defn get-matrix
  [db _]
  (-> db :cfg :kll :matrix))

(rf/reg-sub :cfg-matrix get-matrix)

(defn get-selected-key
  [db _]
  (-> db :cfg :selected-key))

(rf/reg-sub :cfg-selected-key get-selected-key)

(defn changes?
  [db _]
  (let [cfg (:cfg db)]
    (not= (:kll cfg) (:orig-kll cfg))))

(rf/reg-sub :cfg-changes? changes?)

(defn get-current-actions
  [db _]
  (or (-> db :cfg :current-actions) #{}))

(rf/reg-sub :cfg-current-actions get-current-actions)

(defn get-key-group-state
  [db [_ group]]
  (or (-> db :cfg :key-group-states group) :visible))

(rf/reg-sub :cfg-key-group-state get-key-group-state)
