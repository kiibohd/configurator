(ns kii.ui.conf.subscriptions
  (:require [re-frame.core :as rf]))

(defn get-cfg
  [db _]
  (:conf db))

(rf/reg-sub :conf get-cfg)

(defn get-active-layer
  [db _]
  (or (-> db :conf :active-layer) 0))

(rf/reg-sub :conf/active-layer get-active-layer)

(defn loaded?
  [db _]
  (-> db :conf :loaded?))

(rf/reg-sub :conf/loaded? loaded?)

(defn get-defines
  [db _]
  (-> db :conf :kll :header))

(rf/reg-sub :conf/defines get-defines)

(defn get-matrix
  [db _]
  (-> db :conf :kll :matrix))

(rf/reg-sub :conf/matrix get-matrix)

(defn get-selected-key
  [db _]
  (-> db :conf :selected-key))

(rf/reg-sub :conf/selected-key get-selected-key)

(defn changes?
  [db _]
  (let [cfg (:conf db)]
    (not= (:kll cfg) (:orig-kll cfg))))

(rf/reg-sub :conf/changes? changes?)

(defn get-current-actions
  [db _]
  (or (-> db :conf :current-actions) #{}))

(rf/reg-sub :conf/current-actions get-current-actions)

(defn get-key-group-state
  [db [_ group]]
  (or (-> db :conf :key-group-states group) :visible))

(rf/reg-sub :conf/key-group-state get-key-group-state)
