(ns kii.ui.core
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [kii.env :as env]
            [kii.test.runner]
            [kii.ui.browser]
            [kii.ui.subscriptions]
            [kii.ui.base.components :as components]
            [kii.ui.handlers])
  )

(enable-console-print!)

(defn mount-root []
  (r/render
    [components/base-layout]
    (js/document.getElementById "container"))
  )

(defn init []
  (print "Refreshed.")
  (kii.test.runner/run))

(defn ^:export full-init []
  (rf/dispatch-sync [:boot])
  (kii.ui.browser/register-keypress-events)
  (mount-root))

(defonce root (full-init))

(full-init)

;; TODO: Move out.
;; Dev-mode.
(when env/dev?
  (rf/dispatch [:add-device
                {:product-id 0xb04d
                 :vendor-id 0x1c11
                 :bus-no 9
                 :path "9-9.9.1"
                 :serial-no ""
                 :manufacturer "Input:Club"
                 :product "Keyboard - MDErgo1 PartialMap pjrcUSB full"
                 :raw nil}])
  (rf/dispatch [:add-device
                {:product-id 0xb04d
                 :vendor-id 0x1c11
                 :bus-no 9
                 :path "9-9.9.3"
                 :serial-no ""
                 :manufacturer "Input:Club"
                 :product "Keyboard - MD1.1 PartialMap pjrcUSB full"
                 :raw nil}])
  (rf/dispatch [:add-device
                {:product-id 0xb007
                 :vendor-id 0x1c11
                 :bus-no 9
                 :path "9-9.9.2"
                 :serial-no ""
                 :manufacturer "Input:Club"
                 :product "Keyboard - WhiteFox PartialMap pjrcUSB full"
                 :raw nil}
                ]))
