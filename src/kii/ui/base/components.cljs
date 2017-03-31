(ns kii.ui.base.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.device.keyboard :as keyboard]
            [kii.ui.conf.components :as conf]
            [kii.ui.alert.components :as alert]
            [kii.ui.util :as util]))

(declare sheet)

;;==== Selected Keyboard Header ====;;
(defn selected-keyboard-comp
  [device]
  (if (nil? device)
    [:div
     [:h2 "Input:Club"]]
    (let [kbd (keyboard/product->keyboard (:product device))]
      [:div
       [:h2 (str (:manufacturer device) " - "
                 (if (keyboard/flashable? device)
                   "Ready to Flash"
                   (:display kbd)))]])))

(defn selected-keyboard []
  (let [kbd (rf/subscribe [:device/active])]
    (fn []
      (selected-keyboard-comp @kbd))))

;;==== Keyboard Select =====;;
(defn keyboard-display-comp
  [d]
  [:li
   {:key        (:path d)
    :class-name (:kbd-item sheet)
    :on-click   #(util/dispatch-all
                   [:device/set-active d]
                   [:panel/set-active :choose-layout])}
   [:div (str (:manufacturer d))]
   [:div (str (:product d))]])

(defn keyboard-select-comp
  [devices]
  [:div
   [:h3 "Select a device"]
   [:ul
    (map keyboard-display-comp devices)]])

(defn keyboard-select
  []
  (let [devices (rf/subscribe [:device/all])]
    (fn [] (keyboard-select-comp @devices))))

;;==== Layout Select ====;;
(defn layout-display-comp
  [name]
  [:li
   {:key        (str name)
    :class-name (:layout-item sheet)
    :on-click   #(util/dispatch-all
                   [:layout/set-active name]
                   [:panel/set-active :choose-activity])}
   [:span (str name)]
   ])

(defn layout-select-comp
  [device]
  (let [kbd (keyboard/product->keyboard (:product device))]
    [:h3 "Select a layout."
     [:ul (map layout-display-comp (:layouts kbd))]]))

(defn layout-select
  []
  (let [kbd (rf/subscribe [:device/active])]
    (fn []
      (layout-select-comp @kbd))))

;;==== Activity Select ====;;

(defn activity-select
  []
  [:div {:style {:width "80vw" :margin "20px"}}
   [:h3 "What do you want to do?"
    [:ul
     [:li
      {:on-click #(util/dispatch-all
                    [:start-configurator]
                    [:panel/set-active :configurator])}
      "Configure"]
     [:li "Flash"]]]])

;;==== Base Layout =====;;
(defn base-layout-comp
  [initialized? panel]
  (if initialized?
    [:div {:class (:main-container sheet)}
     [selected-keyboard]
     [:hr]
     [:div {:style {:display "inline-block"}}
      [alert/alert-popover]
      (cond
        (= panel :home) [keyboard-select]
        (= panel :choose-layout) [layout-select]
        (= panel :choose-activity) [activity-select]
        (= panel :configurator) [conf/main]
        :else [:h3 "Unknown Panel!"])]]
    [:div
     [:h3 "Initializing..."]]
    ))

(defn base-layout []
  (let [panel (rf/subscribe [:panel/active])
        initialized? (rf/subscribe [:initialized?])]
    (fn []
      (base-layout-comp @initialized? @panel))))

;;==== Base Stylesheet ====;;

(defstyle
  sheet
  [:html
   {:height "100%"}]
  [:body
   {:background-color "white"
    :padding          "0 20px"
    :font-family      "Jura, san-serif"
    :font-weight      "500"}]
  [".main-container"
   {:display      "inline-block"
    :min-width    "100%"
    :margin-right "20px"}]
  [:a {:text-decoration "none"}]
  (do [[".material-icons.md-48"
        {:font-size "48px"}]
       [".material-icons.md-36"
        {:font-size "36px"}]
       [".material-icons.md-inactive"
        {:opacity "0.3"}]])
  [".kbd-item"
   {:font-variant     "small-caps"
    :width            "600px"
    :background-color "palevioletred"
    :list-style       "none"
    :margin           "20px"
    :padding          "0.25em"
    :text-align       "center"}]
  [".layout-item"
   {:font-variant     "small-caps"
    :width            "600px"
    :background-color "palevioletred"
    :list-style       "none"
    :padding          "0.25em"
    :margin           "20px"
    :text-align       "center"}]
  )
