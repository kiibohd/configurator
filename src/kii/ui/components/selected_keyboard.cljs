(ns kii.ui.components.selected-keyboard
  (:require [kii.device.keyboard :as keyboard]
            [kii.ui.re-frame :refer [<<= <== =>> >=> =A=>]]
            [cuerdas.core :as str]))

(defn selected-keyboard []
  (fn []
    (if-let [device (<<= [:device/active])]
      (let [kbd (keyboard/product->keyboard (:product device))]
        [:div
         [:h2 (str/fmt "%s%s"
                       ;(-> (:manufacturer device) str/title str/trim str/collapse-whitespace)
                       (:display kbd)
                       (if (keyboard/flashable? device) " (Ready to Flash)" ""))]])
      [:div
       [:h2 "Kiibohd Configurator"]])))
