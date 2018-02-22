(ns kii.ui.device.handlers
  (:require [re-frame.core :as rf]
            [kii.env :as env]
            [kii.ui.re-frame :refer [<<= <== =>> >=> =A=>]]
            [kii.device.keyboard :as keyboard]))

(declare seed-devices)

(rf/reg-event-db
  :device/successful-watch
  (fn [db _]
    db))

(defn success-update-devices
  [db _]
  (seed-devices)
  (assoc db :usb/polled? true))

(rf/reg-event-db :device/successful-update success-update-devices)

(defn filter-device
  [devices path]
  (filterv #(not= path (:path %)) devices))

(defn add-device [db [_ device]]
  (let [devices (:devices db)
        without (filter-device devices (:path device))]
    (if (keyboard/ic? device)
      (assoc db :devices (conj without device))
      db)))

(rf/reg-event-db :device/add add-device)

(defn remove-device [db [_ device]]
  (let [devices (seq (:devices db))
        without (filter-device devices (:path device))]
    (assoc db :devices without)))

(rf/reg-event-db :device/remove remove-device)

(defn set-active-device
  [db [_ device]]
  (assoc db :active-keyboard device))

(rf/reg-event-db :device/set-active set-active-device)

(defn seed-devices []
  ;; TODO: Evaluate if we should always do this...
  ;;(when env/dev?)
  (=A=>
    [:device/add {:product-id   0xb04d
                  :vendor-id    0x1c11
                  :bus-no       9
                  :path         "9-9.9.1"
                  :serial-no    ""
                  :manufacturer "Input:Club"
                  :product      "Keyboard - MDErgo1 PartialMap pjrcUSB full"
                  :raw          nil
                  :connected    false}]
    [:device/add {:product-id   0xb04d
                  :vendor-id    0x1c11
                  :bus-no       9
                  :path         "9-9.9.2"
                  :serial-no    ""
                  :manufacturer "Input:Club"
                  :product      "Keyboard - MD1 PartialMap pjrcUSB full"
                  :raw          nil
                  :connected    false}]
    [:device/add {:product-id   0xb04d
                  :vendor-id    0x1c11
                  :bus-no       9
                  :path         "9-9.9.3"
                  :serial-no    ""
                  :manufacturer "Input:Club"
                  :product      "Keyboard - MD1.1 PartialMap pjrcUSB full"
                  :raw          nil
                  :connected    false}]
    [:device/add {:product-id   (if env/dev? 0xb007 0xb04d)
                  :vendor-id    0x1c11
                  :bus-no       9
                  :path         "9-9.9.4"
                  :serial-no    ""
                  :manufacturer "Input:Club"
                  :product      "Keyboard - WhiteFox PartialMap pjrcUSB full"
                  :raw          nil
                  :connected    false}]
    [:device/add {:product-id   0xb04d
                  :vendor-id    0x1c11
                  :bus-no       9
                  :path         "9-9.9.5"
                  :serial-no    ""
                  :manufacturer "Input:Club"
                  :product      "Keyboard - KType PartialMap pjrcUSB full"
                  :raw          nil
                  :connected    false}]
    [:device/add {:product-id   0xb04d
                  :vendor-id    0x1c11
                  :bus-no       9
                  :path         "9-9.9.6"
                  :serial-no    ""
                  :manufacturer "Input:Club"
                  :product      "Keyboard - Kira PartialMap pjrcUSB full"
                  :raw          nil
                  :connected    false}]
    #_[:device/add {:product-id   0xb04d
                  :vendor-id    0x1c11
                  :bus-no       9
                  :path         "9-9.9.4"
                  :serial-no    nil
                  :manufacturer nil
                  :product      nil
                  :raw          nil
                  :connected    true}]
    )
  )