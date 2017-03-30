(ns kii.ui.conf.components.keyboard
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.conf.palette :as palette]
            [kii.device.keyboard :as keyboard]
            [kii.util :as u]
            [kii.ui.conf.subscriptions]))

;;==== Configurator ====;;

(def layout-settings
  {:backdrop-padding 20
   :size-factor      16
   :cap-size-factor  13})

(defstyle conf-styles
  [".backdrop"
   {:background-color (:silver palette/palette)
    :border-left      "1px solid transparent"
    :border-right     "1px solid transparent"
    :border-bottom    "1px solid transparent"
    :padding          (str (:backdrop-padding layout-settings) "px")}]
  [".keyboard"
   {:font-family "Jura"
    :font-weight "500"
    :position    "relative"}]
  [".key"
   {:position "absolute"
    :overflow "hidden"
    }]
  [".base"
   {:background-color (:gray palette/palette)
    :border           (str "2px solid transparent"          ;;(:black palette)
                           )
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
    :margin-top      "0.15em"
    :min-height      "1.1em"
    :flex-direction  "row"
    :display         "flex"
    :alight-items    "center"
    :justify-content "center"
    }
   [:span
    {:padding "0 0.25em"}]]
  )

;;==== Key ====;;
(defn label-comp
  [layer data]
  (let [label1 (:label1 data)
        label2 (:label2 data)]
    [:div
     {:class-name (:label conf-styles)}
     [:spanb
      {:class-name (str "fg-layer-" layer)}
      (u/unescape (or label1 " "))]
     (if label2
       [:span
        {:class-name (str "fg-layer-" layer)}
        (u/unescape label2)])]
    ))

(defn key-comp
  [key active-layer selected-key]
  (let [board (or (:board key) 0)
        code (:code key)
        sf (:size-factor layout-settings)
        csf (:cap-size-factor layout-settings)
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

(defn get-size
  [matrix]
  (let [right-most (apply max-key #(+ (:x %) (:w %)) matrix)
        bottom-most (apply max-key #(+ (:y %) (:h %)) matrix)
        sf (:size-factor layout-settings)]
    {:height (* sf (+ (:y bottom-most) (:h bottom-most)))
     :width  (* sf (+ (:x right-most) (:w right-most)))}
    ))

;;==== Keyboard ====;;
(defn keyboard-comp
  [active-layer matrix selected-key]
  (let [{:keys [width height]} (get-size matrix)]
    [:div
     {:class-name (:backdrop conf-styles)
      :style      {:border-color (palette/get-layer-fg active-layer)
                   :width        width                      ;;(+ width (* 2 (:backdrop-padding layout-settings)))
                   :height       height                     ;;(+ height (* 2 (:backdrop-padding layout-settings)))
                   }
      :on-click   #(if-not (nil? selected-key)
                     (rf/dispatch [:set-selected-key nil]))}
     [:div
      {:class-name (:keyboard conf-styles)
       :style      {:width  width
                    :height height}}
      (map #(key-comp % active-layer selected-key) matrix)]
     ]))

(defn keyboard []
  (let [active-layer (rf/subscribe [:conf/active-layer])
        matrix (rf/subscribe [:conf/matrix])
        selected-key (rf/subscribe [:conf/selected-key])]
    (keyboard-comp @active-layer @matrix @selected-key)))

