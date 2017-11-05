(ns kii.ui.alert.components
  (:require [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.styling :as styling]))

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
    :font-family   styling/font-stack
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
  (when-not (empty? alerts)
    [:div {:class (:container alert-styles)}
     (for [{:keys [msg type key] :as alert} alerts]
       [:div {:key (or key msg)}
        [:span {:class (str (:alert alert-styles) " ")}
         msg
         [:div
          [:button {:class    (:close alert-styles)
                    :on-click #(rf/dispatch [:alert/remove alert])}
           [:i {:class "material-icons"}
            "close"]]
          [:span {:class (str (type alert-styles) " " (:status-icon alert-styles))}
           [:i {:class "material-icons"}
            (type alert-icons)]]]
         ]])]))

(defn alert-popover []
  (let [alerts (rf/subscribe [:alert/all])]
    [alert-popover-comp @alerts]))
