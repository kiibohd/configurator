(ns kii.ui.conf.subscriptions
  (:require [re-frame.core :as rf]
            [kii.ui.conf.key-group.subscriptions]
            [kii.ui.conf.actions.subscriptions]
            [kii.ui.conf.keyboard.subscriptions]
            [kii.ui.conf.layer-select.subscriptions]
            [kii.ui.conf.config-tabs.subscriptions]
            [kii.ui.conf.custom-kll.subscriptions]))

(defn get-cfg
  [db _]
  (:conf db))

(rf/reg-sub :conf get-cfg)

(defn loaded?
  [db _]
  (-> db :conf :loaded?))

(rf/reg-sub :conf/loaded? loaded?)

(defn get-kll
  [db _]
  (-> db :conf :kll))

(rf/reg-sub :conf/kll get-kll)

(defn get-defines
  [db _]
  (-> db :conf :kll :defines))

(rf/reg-sub :conf/defines get-defines)

(defn get-headers
  [db _]
  (-> db :conf :kll :header))

(rf/reg-sub :conf/headers get-headers)

(defn get-matrix
  [db _]
  (-> db :conf :kll :matrix))

(rf/reg-sub :conf/matrix get-matrix)

(defn changes?
  [db _]
  (let [cfg (:conf db)]
    (not= (:kll cfg) (:orig-kll cfg))))

(rf/reg-sub :conf/changes? changes?)

(defn get-mode
  [db _]
  (-> db :conf :mode))

(rf/reg-sub :conf/mode get-mode)

(defn get-ui-settings
  [db _]
  (-> db :conf :ui-settings))

(rf/reg-sub :conf/ui-settings get-ui-settings)