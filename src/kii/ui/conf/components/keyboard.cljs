(ns kii.ui.conf.components.keyboard
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.conf.util :as conf-util]
            [kii.ui.conf.palette :as palette]
            [kii.device.keyboard :as keyboard]
            [kii.util :as u]))

(defstyle conf-styles
          [".backdrop"
           {:background-color (:silver palette/palette)
            :border-left      "1px solid transparent"
            :border-right     "1px solid transparent"
            :border-bottom    "1px solid transparent"
            }]
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
          [".label"
           {:font-size       "13px"
            :font-weight     "300"
            :margin-top      "0.15em"
            :height          "14px"
            :flex-direction  "row"
            :display         "flex"
            :align-items     "center"
            :justify-content "center"
            }
           [:span
            {:padding "0 0.25em"}]]
          )

;;==== Key ====;;

;; TODO - When no label, but trigger put in ✲ (open asterisk)
;;        When a label is present make it italic

(defn label-comp
  [layer data]
  (let [label1 (:label1 data)
        label2 (:label2 data)]
    [:div
     {:class-name (:label conf-styles)
      :style (:style data)}
     [:span
      {:class-name (str "fg-layer-" layer)}
      (u/unescape (or label1 " "))]
     (if label2
       [:span
        {:class-name (str "fg-layer-" layer)}
        (u/unescape label2)])]
    ))

(defn key-comp
  [key active-layer selected-key ui-settings]
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
                      (rf/dispatch [:set-selected-key (if selected? nil key)]))
       }
      (let [layers (:layers key)
            topn (+ 1 active-layer)
            midn active-layer
            botn (if (= 0 active-layer) 2 0)
            layer #(get layers (keyword (str %)))]
        [:div
         {:class-name (:cap conf-styles)
          :style      {:width  (- (* sf (:w key)) 10)
                       :height (- (* sf (:h key)) 12)}}
         (label-comp topn (layer topn))
         (label-comp midn (layer midn))
         (label-comp botn (layer botn))
         ])]
     ])
  )


;;==== Keyboard ====;;
(defn keyboard-comp
  [active-layer matrix selected-key ui-settings]
  (let [{:keys [width height]} (conf-util/get-size matrix ui-settings)]
    [:div
     {:class-name (:backdrop conf-styles)
      :style      {:border-color (palette/get-layer-fg active-layer)
                   :width        width                      ;;(+ width (* 2 (:backdrop-padding layout-settings)))
                   :height       height                     ;;(+ height (* 2 (:backdrop-padding layout-settings)))
                   :padding      (str (:backdrop-padding ui-settings) "px")
                   }
      :on-click   #(if-not (nil? selected-key)
                     (rf/dispatch [:set-selected-key nil]))}
     [:div
      {:class-name (:keyboard conf-styles)
       :style      {:width  width
                    :height height}}
      (map #(key-comp % active-layer selected-key ui-settings) matrix)]
     ]))

(defn keyboard []
  (let [active-layer (rf/subscribe [:conf/active-layer])
        matrix (rf/subscribe [:conf/matrix])
        selected-key (rf/subscribe [:conf/selected-key])
        ui-settings (rf/subscribe [:conf/ui-settings])]
    (keyboard-comp @active-layer @matrix @selected-key @ui-settings)))