(ns kii.ui.core
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [kii.env :as env]
            [kii.test.runner]
            [kii.ui.util :as u]
            [kii.ui.browser]
            [kii.ui.subscriptions]
            [kii.ui.base.components]
            [kii.ui.handlers])
  )

(enable-console-print!)

(declare seed-devices)

(defn mount-root []
  (r/render
    [kii.ui.base.components/base-layout]
    (js/document.getElementById "container"))
  )

(defn ^:export full-init []
  (rf/dispatch-sync [:boot])
  (kii.ui.browser/register-keypress-events)
  (mount-root)
  (seed-devices))

(defn init []
  (print "Refreshed.")
  (kii.test.runner/run)
  (full-init))

(defonce root
  (full-init))

(defn seed-devices []
  (when env/dev?
    (u/dispatch-all
      [:add-device {:product-id   0xb04d
                    :vendor-id    0x1c11
                    :bus-no       9
                    :path         "9-9.9.1"
                    :serial-no    ""
                    :manufacturer "Input:Club"
                    :product      "Keyboard - MDErgo1 PartialMap pjrcUSB full"
                    :raw          nil}]
      [:add-device {:product-id   0xb04d
                    :vendor-id    0x1c11
                    :bus-no       9
                    :path         "9-9.9.3"
                    :serial-no    ""
                    :manufacturer "Input:Club"
                    :product      "Keyboard - MD1.1 PartialMap pjrcUSB full"
                    :raw          nil}]
      [:add-device {:product-id   0xb007
                    :vendor-id    0x1c11
                    :bus-no       9
                    :path         "9-9.9.2"
                    :serial-no    ""
                    :manufacturer "Input:Club"
                    :product      "Keyboard - WhiteFox PartialMap pjrcUSB full"
                    :raw          nil}
       ])
    ))