(ns kii.ui.conf.subscriptions
  (:require [re-frame.core :as rf]
            [kii.ui.conf.key-group.subscriptions]
            [kii.ui.conf.actions.subscriptions]
            [kii.ui.conf.keyboard.subscriptions]
            [kii.ui.conf.layer-select.subscriptions]))

(defn get-cfg
  [db _]
  (:conf db))

(rf/reg-sub :conf get-cfg)

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

(defn changes?
  [db _]
  (let [cfg (:conf db)]
    (not= (:kll cfg) (:orig-kll cfg))))

(rf/reg-sub :conf/changes? changes?)


