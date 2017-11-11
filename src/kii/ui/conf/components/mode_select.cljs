(ns kii.ui.conf.components.mode-select
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.conf.palette :as palette]
            [kii.device.keyboard :as keyboard] ))

(defstyle mode-select-style
  [".mode-select"
   {:margin-right  "20px"}]
  [".btn"
   {:font-size     "20px"
    :color         (:gray palette/palette)
    :background    "rgba(0, 0, 0, 0)"
    :border        "none"
    :border-bottom (str "solid 8px " (:silver palette/palette))
    :padding       "2px 20px"}
   ["&:hover"
    ["&:enabled"
     {:border-bottom "solid 8px #4CACFF"
      :cursor        "pointer"}
     ["&.active"
      {:border-bottom (str "solid 8px " (:blue palette/palette))
       :cursor        "default"}]
     ]
    ["&:disabled"
     {:cursor  "not-allowed"}]]
   ["&.active"
    {:border-bottom (str "solid 8px " (:blue palette/palette))
     :color         (:blue palette/palette)}]
   ["&:focus"
    {:outline "none"}]])

(defn mode-select-comp
  [mode active-keyboard]
  [:div {:class (:mode-select mode-select-style)}
   [:button
    {:class    (str (:btn mode-select-style) (if (= mode :keymap) " active"))
     :on-click #(when-not (= mode :keymap)
                  (rf/dispatch [:conf/set-active-config-tab :keys])
                  (rf/dispatch [:conf/mode-update :keymap]))}
    "keymap"]
   [:button {:class (str (:btn mode-select-style) (if (= mode :visuals) " active"))
             :disabled (false? (:visuals-enabled? active-keyboard))
             :on-click #(when-not (= mode :visuals)
                          (rf/dispatch [:conf/set-active-config-tab :manage-animations])
                          (rf/dispatch [:conf/mode-update :visuals]))}
    "visuals"]])

(defn mode-select []
  (let [mode (rf/subscribe [:conf/mode])
        active-device (rf/subscribe [:device/active])
        active-keyboard (keyboard/product->keyboard (:product @active-device))]
    [mode-select-comp @mode active-keyboard]))
