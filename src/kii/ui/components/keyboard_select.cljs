(ns kii.ui.components.keyboard-select
  (:require [reagent.core :as r]
            [kii.device.keyboard :as keyboard]
            [kii.ui.re-frame :refer [<<= <== =>> >=> =A=>]]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [cuerdas.core :as str]
            [kii.ui.components.home :refer [register-panel]]
            [kii.ui.components.toolbar :as toolbar]
            [cljs-react-material-ui.reagent :as mui]))

(defn- build-home [disabled?]
  {:name      :home
   :component (fn []
                [mui/icon-button
                 {:icon-style {:font-size "36px"}
                  :tooltip    "Home"
                  :on-click   #(=>> [:nav/home])
                  :disabled   disabled?}
                 [mui/font-icon
                  {:class "material-icons md-36"}
                  "home"]
                 ])}
  )

(defn- build-flash [disabled?]
  {:name      :quick-flash
   :component (fn []
                [mui/icon-button
                 {:icon-style {:font-size "36px"}
                  :tooltip    "Quick Flash"
                  :on-click   #(=>> [:panel/set-active :flash])
                  :disabled   disabled?}
                 [mui/font-icon
                  {:class "material-icons md-36"}
                  "flash_on"]
                 ])}
  )

(defn keyboard-display
  [device]
  (let [kbd (keyboard/product->keyboard (:product device))
        variants (:variants kbd)
        action (if (= 1 (count variants))
                 ;; TODO - This needs to get refactored out 3 places now initiate conf mode
                 #(do
                    (>=> [:device/set-active device])
                    (>=> [:variant/set-active (first variants)])
                    (>=> [:layout/set-active (first (get-in kbd [:layouts (first variants)]))])
                    (=>> [:start-configurator true])
                    (=>> [:panel/set-active :configurator]))
                 #(=A=> [:device/set-active device]
                        [:panel/set-active :choose-variant]))]
    [:a
     {:key      (:path device)
      :style    {:cursor  "pointer"
                 :margin  "20px"
                 :padding "0.25em"}
      :on-click action}
     [:img {:src    (str "img/" (:image kbd))
            :alt    (:display kbd)
            :title  (:display kbd)
            :height "200px"
            :width  "200px"}]
     ]))


(defn keyboard-select []
  (fn []
    (let [devices (<<= [:device/all])
          [connected disconnected] ((juxt filter remove) #(true? (:connected %)) devices)]
      (toolbar/add-to-menu (build-flash (not-any? keyboard/flashable? devices)))

      [:div
       [:h3 "Connected Devices"]
       [:div
        (if (empty? connected)
          [:span {:style {:margin-left "4em" :font-style "italic" :font-size "1.25em"}} "None"]
          (for [device connected]
            ^{:key (:path device)}
            [keyboard-display device]))]
       (when-not (empty? disconnected)
         [:div
          [:br]
          [:h3 "Available Devices"]
          [:div
           (for [device disconnected]
             ^{:key (:path device)}
             [keyboard-display device])
           ]])]
      )))

;; Side Effects

(register-panel :keyboard-select keyboard-select
                :on-deactivate (fn [_ __]
                                 (toolbar/replace-in-menu (build-home false))
                                 (toolbar/remove-from-menu :quick-flash))
                :on-activate (fn [_ __]
                               (toolbar/replace-in-menu (build-home true))))

(toolbar/add-to-menu (build-home true))
