(ns kii.ui.conf.components.config-tabs
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.util :as u]
            [kii.ui.conf.util :as conf-util]
            [kii.ui.conf.key-group.components]
            [kii.ui.conf.palette :as palette]
            [kii.ui.conf.components.settings]
            [kii.ui.conf.components.macros]
            [kii.ui.conf.custom-kll.components]))

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

(defn tab-item
  [{:keys [id icon]} active-tab]
  [:div {:key (str id)
         :class    (u/->c+s styles :tab (when (= active-tab id) :active))
         :on-click #(rf/dispatch [:conf/set-active-config-tab id])}
   [:i {:class (str "material-icons md-48")}
    icon]])

(defn tab-strip-conf
  [items active-tab]
  [:div {:class (:tab-container styles)}
   (map #(tab-item % active-tab) items)
   ]
  )

(defn config-tabs
  [items]
  (let [active-tab (rf/subscribe [:conf/active-config-tab])
        matrix (rf/subscribe [:conf/matrix])
        ui-settings (rf/subscribe [:conf/ui-settings])
        width (:width (conf-util/get-size @matrix @ui-settings))]
    [:div
     [tab-strip-conf items @active-tab]

     [:div {:style {:width      (+ width 2 (* 2 (:backdrop-padding @ui-settings)))
                    :margin-top "15px"}}
      [:div {:style {:border       "1px solid black"
                     :margin-left  "55px"
                     :padding-left "20px"
                     :min-height "250px"}}
       (when-let [x (first (filter #(= @active-tab (:id %)) items))]
         [(:tab x)])
       [:div {:style {:clear "both"
                      :height "14px"}}]
       ]]]
    ))
