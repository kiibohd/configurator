(ns kii.ui.subscriptions
  (:require [kii.ui.conf.subscriptions]
            [kii.ui.device.subscriptions]
            [kii.ui.alert.subscriptions]
            [re-frame.core :as rf]
            [cuerdas.core :as str]
            ))

(rf/reg-sub
 :initialized?
 (fn  [db _]
   (and (not (empty? db))
        (:usb/polled? db)
        )))

(rf/reg-sub
 :variant/active
 (fn [db _]
   (:active-variant db)))

(rf/reg-sub
  :layout/active
  (fn [db _]
    (:active-layout db)))

(rf/reg-sub
 :panel/active
 (fn [db _]
   (:active-panel db)))

(rf/reg-sub
  :panel/previous
  (fn [db _]
    (:prev-panel db)))

(rf/reg-sub :local/all
  (fn [db _] (-> db :local)))

(rf/reg-sub :local/dfu-util-path
  :<- [:local/all]
  (fn [local _]
    (let [value (:dfu-util-path local)]
      (if (str/empty-or-nil? (str/trim value))
        nil
        value))))

(rf/reg-sub :local/last-download
  :<- [:local/all]
  (fn [local _] (:last-download local) ))

(rf/reg-sub :local/recent-downloads
  :<- [:local/all]
  (fn [local _] (:recent-downloads local)))

(rf/reg-sub :local/last-ver-check
  :<- [:local/all]
  (fn [local _] (:last-ver-check local)))

(rf/reg-sub :local/canned-animations
  :<- [:local/all]
  (fn [local _] (:canned-animations local)))
