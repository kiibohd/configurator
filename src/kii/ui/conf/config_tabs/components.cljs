(ns kii.ui.conf.config-tabs.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.util :as u]
            [kii.ui.conf.key-group.components]
            [kii.ui.conf.keyboard.components :as comp-kbd]
            [kii.ui.conf.palette :as palette]))


(defstyle styles
  [".tab-container"
   {:float "left"}]
  [".active"
   {:border "1px solid black"
    :border-right-color "white"}]
  [".tab"
   {:text-align "center"
    ;;:height "54px"
    :width "54px"
    :margin-bottom "10px"
    :padding "5px 0"
    :border-radius       "4px 0 0 4px"
    :color (:darkgray palette/palette)}]
  )


(defn config-tab-strip-conf
  [active-tab]
  [:div {:class (:tab-container styles)}
   ;;TODO Reduce repetition, make a fn
    [:div
     {:class (u/->c+s styles :tab (when (= active-tab :keys) :active))
      :on-click #(rf/dispatch [:conf/set-active-config-tab :keys])}
     [:i
      {:class (str "material-icons md-48")}
      "keyboard"]]
   [:div
    {:class (u/->c+s styles :tab (when (= active-tab :settings) :active))
     :on-click #(rf/dispatch [:conf/set-active-config-tab :settings])}
    [:i
     {:class (str "material-icons md-48")}
     "settings"]]
   [:div
    {:class (u/->c+s styles :tab (when (= active-tab :macros) :active))
     :on-click #(rf/dispatch [:conf/set-active-config-tab :macros])}
    [:i
     {:class (str "material-icons md-48")}
     "videocam"]]
   ])

(defn config-tabs
  []
  (let [active-tab (rf/subscribe [:conf/active-config-tab])
        matrix (rf/subscribe [:conf/matrix])
        width (:width (comp-kbd/get-size @matrix))]
    [:div
     [config-tab-strip-conf @active-tab]

     [:div {:style {:width      (+ width 2 (* 2 (:backdrop-padding comp-kbd/layout-settings)))
                    :margin-top "15px"}}
      [:div {:style {:border       "1px solid black"
                     ;;:border-radius "4px"
                     :margin-left  "55px"
                     :padding-left "20px"
                     :min-height "250px"}}
       (case @active-tab
         :keys [kii.ui.conf.key-group.components/key-groups]
         :settings [:h2 "Settings"]
         :macros [:h2 "Macros"]
         )
       ]]]
    ))

