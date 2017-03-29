(ns kii.ui.base.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.device.keyboard :as keyboard]
            [kii.ui.conf.components.core :as conf]
            [kii.ui.util :as util]))

(declare sheet)

;;==== Alerts ====;;
(def alert-palette
  {:error   ["#cc0000" "#8b0000"]
   :warning ["#ec7a08" "#b35c00"]
   :success ["#3f9c35" "#2d7623"]
   :info    ["#39a5dc" "#0088ce"]})

(def alert-icons
  {:error   "error_outline"
   :warning "warning"
   :success "done"
   :info    "info_outline"})

(defstyle
  alert-styles
  [".container"
   {:clear     "both"
    :float     "left"
    :max-width "75%"}]
  [".alert"
   {:box-shadow    "0 2px 6px rgba(3,3,3,.2)"
    :display       "inline-block"
    :margin-right  "10px"
    :margin-bottom "10px"
    :border        "1px solid #bbb"
    :font-family   "Jura"
    :font-weight   "500"
    :font-size     "15px"
    :position      "relative"
    :opacity       "1"
    :color         "black"
    :padding       "11px"
    :padding-left  "48px"
    :padding-right "48px"
    }]
  [".success"
   {:background-color (-> alert-palette :success first)}]
  [".error"
   {:background-color (-> alert-palette :error first)}]
  [".warning"
   {:background-color (-> alert-palette :warning first)}]
  [".info"
   {:background-color (-> alert-palette :info first)}]
  [".close"
   {:margin-left      "10px"
    :position         "absolute"
    :top              "0"
    :right            "10px"
    :text-align       "center"
    :height           "100%"
    :background-color "transparent"
    :padding          "0"
    :border           "none"
    :color            "#bbb"
    :float            "right"
    :display          "inline-block"
    :cursor           "pointer"}
   ["&:hover"
    {:color "black"}]
   ["&:active:enabled"
    {:outline "0"
     :opacity "0.75"}]
   ["&:focus"
    {:outline "0"}]]
  [".status-icon"
   {:width       "40px"
    :position    "absolute"
    :bottom      "0px"
    :top         "-1px"
    :left        "-1px"
    :padding-top "7px"
    :text-align  "center"
    :color       "#f6f6f6"
    }])

(defn- alert-popover-comp
  [alerts]
  [:div {:class (:container alert-styles)}
   (for [{:keys [msg type] :as alert} alerts]
     [:div {:key msg}
      [:span {:class (str (:alert alert-styles) " ")}
       msg
       [:div
        [:button {:class    (:close alert-styles)
                  :on-click #(rf/dispatch [:remove-alert alert])}
         [:i {:class "material-icons"}
          "close"]]
        [:span {:class (str (type alert-styles) " " (:status-icon alert-styles))}
         [:i {:class "material-icons"}
          (type alert-icons)]]]
       ]])])

(defn alert-popover []
  (let [alerts (rf/subscribe [:alerts])]
    ;;(print (str "Alerts:" @alerts))
    (alert-popover-comp @alerts)))

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
  (let [kbd (rf/subscribe [:active-keyboard])]
    (fn []
      (selected-keyboard-comp @kbd))))

;;==== Keyboard Select =====;;
(defn keyboard-display-comp
  [d]
  [:li
   {:key        (:path d)
    :class-name (:kbd-item sheet)
    :on-click   #(util/dispatch-all
                   [:set-active-device d]
                   [:set-active-panel :choose-layout])}
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
                   [:set-active-layout name]
                   [:set-active-panel :choose-activity])}
   [:span (str name)]
   ])

(defn layout-select-comp
  [device]
  (let [kbd (keyboard/product->keyboard (:product device))]
    [:h3 "Select a layout."
     [:ul (map layout-display-comp (:layouts kbd))]]))

(defn layout-select
  []
  (let [kbd (rf/subscribe [:active-keyboard])]
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
                    [:set-active-panel :configurator])}
      "Configure"]
     [:li "Flash"]]]])

;;==== Base Layout =====;;
(defn base-layout-comp
  [panel]
  [:div {:class (:main-container sheet)}
   [selected-keyboard]
   [:hr]
   [:div {:style {:display "inline-block"}}
    [alert-popover]
    (cond
      (= panel :home) [keyboard-select]
      (= panel :choose-layout) [layout-select]
      (= panel :choose-activity) [activity-select]
      (= panel :configurator) [conf/main]
      :else [:h3 "Unknown Panel!"])]
   ])

(defn base-layout []
  (let [panel (rf/subscribe [:active-panel])]
    (fn []
      (base-layout-comp @panel))))

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
