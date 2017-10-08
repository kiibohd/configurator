(ns kii.ui.conf.mode-select.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :as css]
            [kii.ui.conf.palette :as palette]
            [clojure.pprint]
            ))

(css/defstyle mode-select-style
  [".mode-select"
   {:clear         "both"
    :float         "left"
    :margin-right  "-10px"
    :margin-bottom "10px"}]
  [".btn"
   {:font-size     "20px"
    :color         (:gray palette/palette)
    :background    "rgba(0, 0, 0, 0)"
    :border        "none"
    :border-bottom (str "solid 8px " (:silver palette/palette))
    :padding       "2px 40px"}
   ["&:hover"
    {:border-bottom "solid 8px #4CACFF"
     :cursor        "pointer"}]
   ["&.active"
    {:border-bottom (str "solid 8px " (:blue palette/palette))
     :color         (:blue palette/palette)}]
   ["&:focus"
    {:outline "none"}]])

(defn mode-select-comp
  [mode]
  [:div {:class (:mode-select mode-select-style)}
   [:button
    {:class    (str (:btn mode-select-style) (if (= mode :keymap) " active"))
     :on-click #(when-not (= mode :keymap)
                  (rf/dispatch [:conf/set-active-config-tab :keys])
                  (rf/dispatch [:conf/mode-update :keymap]))}
    "keymap"]
   [:button {:class (str (:btn mode-select-style) (if (= mode :visuals) " active"))
             :on-click #(when-not (= mode :visuals)
                          (rf/dispatch [:conf/set-active-config-tab :custom-animation])
                          (rf/dispatch [:conf/mode-update :visuals]))}
    "visuals"]])

(defn mode-select []
  (let [mode (rf/subscribe [:conf/mode])]
    [mode-select-comp @mode]))
