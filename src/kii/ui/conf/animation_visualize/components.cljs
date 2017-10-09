(ns kii.ui.conf.animation-visualize.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.conf.palette :as palette]
            [kii.device.keyboard :as keyboard]
            [kii.ui.conf.keyboard.components :as conf-kbd]
            [kii.util :as u]))

;; TODO Merge with other keyboard visualization styles
(defstyle conf-styles
  [".backdrop"
   {:background-color (:silver palette/palette)
    :border "1px solid black" }]
  [".keyboard"
   {:position    "relative"}]
  [".key"
   {:position "absolute"
    :overflow "hidden"
    }]
  [".base"
   {:background-color (:gray palette/palette)
    :border           "2px solid transparent"
    :border-radius    "4px"
    :margin           "2px"}]
  [".selected"
   {:border (str "2px solid " (:red palette/palette) " !important")}
   ]
  [".cap"
   {:background-color (:lightgray palette/palette)
    :margin           "2px"
    :margin-bottom    "4px"
    :display          "flex"
    :flex-direction   "column"
    :align-items      "center"
    :justify-content  "center"
    }]
  )

(defn key-comp
  [key selected-key ui-settings]
  (let [board (or (:board key) 0)
        code (:code key)
        sf (:size-factor ui-settings)
        csf (:cap-size-factor ui-settings)
        selected? (= key selected-key)]
    [:div
     {:key        (str board "-" code)
      :class-name (:key conf-styles)
      :style      {:left   (* sf (:x key))
                   :top    (* sf (:y key))
                   :width  (* sf (:w key))
                   :height (* sf (:h key))}}
     [:div
      {:class-name (str (:base conf-styles) " "
                        (if selected? (:selected conf-styles)))
       :style      {:width  (- (* sf (:w key)) 6)
                    :height (- (* sf (:h key)) 6)}
       :on-click   #(do
                      (.stopPropagation %)
                      (rf/dispatch [:set-selected-key (if selected? nil key)]))}
      [:div
       {:class-name (:cap conf-styles)
        :style      {:width  (- (* sf (:w key)) 10)
                     :height (- (* sf (:h key)) 12)}}
       ]]
     ])
  )

(defn keyboard-comp
  [matrix selected-key ui-settings]
  (let [{:keys [width height]} (conf-kbd/get-size matrix ui-settings)]
    [:div
     {:class-name (:backdrop conf-styles)
      :style      {:width        width
                   :height       height
                   :padding      (str (:backdrop-padding ui-settings) "px")}
      :on-click   #(if-not (nil? selected-key)
                     (rf/dispatch [:set-selected-key nil]))}
     [:div
      {:class-name (:keyboard conf-styles)
       :style      {:width  width
                    :height height}}
      (map #(key-comp % selected-key ui-settings) matrix)]
     ])
  )

(defn keyboard
  []
  (let [matrix (rf/subscribe [:conf/matrix])
        selected-key (rf/subscribe [:conf/selected-key])
        ui-settings (rf/subscribe [:conf/ui-settings])]
    [keyboard-comp @matrix @selected-key @ui-settings]))
