(ns kii.ui.conf.layer-select.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.conf.palette :as palette]
            [kii.ui.conf.subscriptions]))

(def layout-settings
  {:tab-height 35})

(defstyle style
  [".nav-tabs"
   {:display               "block"
    :height                (str (+ 1 (:tab-height layout-settings)) "px")
    :list-style-type       "none"
    :margin-bottom         "0px"
    :border-bottom         "1px solid transparent"
    :-webkit-padding-start 0
    :clear                 "both"}
   [:li
    {:cursor              "pointer"
     :display             "block"
     :float               "left"
     :background-color    (:silver palette/palette)
     :height              (str (:tab-height layout-settings) "px")
     :line-height         (str (:tab-height layout-settings) "px")
     :padding             "0 10px"
     :margin-right        "5px"
     :border              "1px solid"
     :border-bottom-color (:silver palette/palette)
     :border-radius       "4px 4px 0 0"
     :min-width           "4.25em"
     :margin-bottom       "-1px"}
    [:span
     {:display "table"
      :margin  "0 auto"}]]
   ]
  [".inactive-tab"
   {:border-color               "transparent !important"
    :background-color           "transparent !important"
    :border-bottom-left-radius  "1px"
    :border-bottom-right-radius "1px"}]

  ;; NOTE: These will come out raw w/o unique names
  (for [i (range 0 8)]
    [(str ".bg-layer-" i)
     {:background-color (palette/get-layer-bg i)}])
  (for [i (range 0 8)]
    [(str ".fg-layer-" i)
     {:color (palette/get-layer-fg i)}])
  )

;;==== Layer Tabs ====;
(defn layer-tabs-comp
  [active-layer]
  [:ul
   {:class-name (:nav-tabs style)
    :style {:border-color (palette/get-layer-fg active-layer)}}
   (for [i (range 0 8)]
     [:li
      {:key (str "layer-" i)
       :class (str "fg-layer-" i " "
                   (when (not= i active-layer) (:inactive-tab style)))
       :on-click #(rf/dispatch [:set-active-layer i])
       }
      [:span (if (= i 0)
               "Base"
               (str "Layer " i))]])])

(defn layer-tabs []
  (let [active-layer (rf/subscribe [:conf/active-layer])]
    (layer-tabs-comp @active-layer)))
