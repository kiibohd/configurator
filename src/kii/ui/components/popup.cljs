(ns kii.ui.components.popup
  (:require [reagent.core :as r]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [cljs-react-material-ui.reagent :as mui]
            [cljs-react-material-ui.icons :as mui-icons]
            [cuerdas.core :as str]
            [kii.ui.conf.palette :as palette]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.styling :as styling]))

;;==== Code Popup ====;;
(defstyle popup-style
  [".outer-container"
   {:position        "fixed"
    :display         "flex"
    :z-index         "999"
    :width           "100vw"
    :height          "100vh"
    :top             "0"
    :left            "0"
    ;;:text-align "center"
    :background      "rgba(0, 0, 0, 0.8)"
    :align-items     "center"
    :justify-content "center"}]
  [".inner-container"
   {:position   "relative"
    :height     "80%"
    :width      "80%"
    :padding    "25px 25px 25px 20px"
    :background "white"}]
  [".closer"
   {:position      "absolute"
    :top           "-12px"
    :right         "-18px"
    :cursor        "pointer"
    :color         (:darkgray palette/palette)
    :border        (str "1px solid " (:darkgray palette/palette))
    :border-radius "30px"
    :background    "white"
    :font-size     "31px"
    :font-weight   "bold"
    :display       "inline-block"
    :line-height   "0px"
    :padding       "11px 3px"
    :font-family   "serif"}
   [:&:before
    {:content "'×'"}]]
  [".title"
   {:position     "absolute"
    :top          "-12px"
    :left         "10px"
    :border       (str "1px solid " (:darkgray palette/palette))
    :background   (:lightpurple palette/palette)
    :font-weight  "bold"
    :font-variant "small-caps"
    :font-size    "20px"
    :padding      "0 5px 5px 5px"
    }]
  [".text"
   {:width       "100%"
    :height      "100%"
    :resize      "none"
    :font-size   "14px"
    :background  "#ECECEC"
    :border      (str "1px solid " (:darkgray palette/palette))
    :font-family styling/monospace-font-stack}
   [:&:focus
    {:outline "0"
     }]]
  [".btns"
   {:float  "right"
    :margin "2px -25px 0 0"}
   ;;:bottom
   [:button
    {:background   (:green palette/palette)
     :border       (str "1px solid " (:darkgray palette/palette))
     :margin       "1px 10px 1px 0"
     :padding      "0 10px 5px 10px"
     :font-weight  "bold"
     :font-variant "small-caps"
     :font-size    "18px"
     }]
   ]
  )

(defn custom-popup [title visible? default-value buttons component]
  (let [data (r/atom default-value)]
    (fn [title visible? default-value buttons]
      (if @visible?
        [:div
         {:class (:outer-container popup-style)}
         [:div {:class (:inner-container popup-style)}
          [:span
           {:class (:title popup-style)}
           title]
          [:a {:class    (:closer popup-style)
               :on-click #(reset! visible? false)}]
          [:div {:style {:width      "100%"
                         :height     "100%"
                         :overflow-y "auto"}}
           [component data]]
          [:div
           {:class (:btns popup-style)}
           (doall (for [btn buttons]
                    [:button
                     {:key      (:text btn)
                      :class    (:btns popup-style)
                      :on-click #((:fn btn) @data)
                      :disabled (and (:disabled? btn) ((:disabled? btn) @data))
                      :style    (:style btn)}
                     (:text btn)]))
           ]]
         ]
        ;; If not visible and it's not the default value, reset it.
        ;; TODO - Change to reaction on atom?
        (when (not= @data default-value)
          (reset! data default-value)
          nil)
        )))
  )

(defn popup [title visible? readonly? default-value buttons]
  (let [data (r/atom default-value)]
    (fn [title visible? readonly? default-value buttons]
      (when @visible?
        [:div
         {:class (:outer-container popup-style)}
         [:div
          {:class (:inner-container popup-style)}
          [:span
           {:class (:title popup-style)}
           title]
          [:a
           {:class    (:closer popup-style)
            :on-click #(reset! visible? false)}]
          [:textarea
           {:class         (:text popup-style)
            :read-only     readonly?
            :wrap          "soft"
            :default-value default-value
            :on-change     #(reset! data (-> % .-target .-value))}
           ]
          [:div
           {:class (:btns popup-style)}
           (doall (for [btn buttons]
                    [:button
                     {:key      (:text btn)
                      :class    (:btns popup-style)
                      :style    (:style btn)
                      :on-click #((:fn btn) @data)}
                     (:text btn)]))
           ]]
         ])))
  )
