(ns kii.ui.conf.config-tabs.subscriptions
  (:require [re-frame.core :as rf]))

;; Options - [:keys :settings :macros]
(defn get-active-config-tab
  [db _]
  (or (-> db :conf :active-config-tab) :keys))

(rf/reg-sub :conf/active-config-tab get-active-config-tab)