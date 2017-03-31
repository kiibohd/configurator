(ns kii.ui.conf.layer-select.subscriptions
  (:require [re-frame.core :as rf]))

(defn get-active-layer
  [db _]
  (or (-> db :conf :active-layer) 0))

(rf/reg-sub :conf/active-layer get-active-layer)