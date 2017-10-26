(ns kii.ui.conf.key-group.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.keys.firmware.map :as fw]
            [kii.ui.conf.util :as conf-util]
            [kii.ui.conf.palette :as palette]
            [kii.ui.conf.components.keyboard :as keeb]
            [kii.util :as u]
            [kii.ui.util :as uiu]
            [kii.keys.core :as keys]
            ))

(defstyle kg-styles
  [".title"
   {:color     "red"
    :font-size "18px"
    :display   "inline-block"}]
  [".key-group"
   {:padding-top   "10px"
    ;;:clear         "both"
    :margin-bottom "10px"}]
  [".container"
   {:display   "flex"
    :flex-wrap "wrap"}]
  [".show-hide"
   {:color  "black"
    :cursor "pointer"}]
  [".hidden"
   {:display "none"}]
  )

;;==== Key ====;;
(defn label-comp
  [data]
  (let [label1 (:label1 data)
        label2 (:label2 data)]
    [:div
     {:class (:label keeb/conf-styles)
      :style (:style data)}
     [:span
      {:class "fg-layer-0"}
      (u/unescape (or label1 " "))]
     (if label2
       [:span
        {:class "fg-layer-0"}
        (u/unescape label2)])]
    ))

(defn key-comp
  [{:keys [name label] :as key} ui-settings]
  (let [sf (:size-factor ui-settings)
        csf (:cap-size-factor ui-settings)
        ksize (* sf 4)]
    [:div
     {:key   name
      :class (:key keeb/conf-styles)
      :style {:width    ksize
              :height   ksize
              :position "relative"}}
     [:div
      {:class    (:base keeb/conf-styles)
       :style    {:width  (- ksize 6)
                  :height (- ksize 6)}
       :on-click #(do
                    (.stopPropagation %)
                    (rf/dispatch [:update-selected-key name]))
       }
      (let [mapped (name (keys/key->iec))]
        [:div
         {:class (:cap keeb/conf-styles)
          :style {:width  (- ksize 10)
                  :height (- ksize 12)}}
         (label-comp {:label1 (:label2 mapped) :style (:style key)})
         (label-comp {:label1 (or (:label1 mapped) label) :style (:style key)})
         (label-comp {})
         ])]
     ])
  )

(defn key-group-comp
  [{:keys [name label]} state ui-settings]
  (let [ks (sort-by :order
                    (filter #(= name (:group %))
                            (vals fw/keys)))]
    [:div {:key   (str name)
           :class (:key-group kg-styles)}
     [:div {:class (:title kg-styles)}
      [:div {:style {:display "flex" :align-items "center"}}
       [:span label]
       [:span {:class    (:show-hide kg-styles)
               :on-click #(rf/dispatch [:toggle-key-group-state name])}
        [:i {:class "material-icons"}
         (if (= state :visible) "arrow_drop_down" "arrow_drop_up")]]
       ]]
     [:div {:class (uiu/->c+s kg-styles :container (if (= state :hidden) :hidden))}
      (map #(key-comp % ui-settings) ks )]]
    )
  )

(defn key-group
  [{:keys [name] :as group} ui-settings]
  (let [state (rf/subscribe [:conf/key-group-state name])]
    (key-group-comp group @state ui-settings)))

(defn key-groups []
  (let [matrix (rf/subscribe [:conf/matrix])
        ui-settings (rf/subscribe [:conf/ui-settings])
        width (:width (conf-util/get-size @matrix @ui-settings))]
    #_[:div {:style {:width      width
                   :margin-top "15px"}}
     [:div {:style {:border       "1px solid black"
                    ;;:border-radius "4px"
                    :margin-left  "55px"
                    :padding-left "20px"}}]]
    [:div

     (doall (map #(key-group % @ui-settings) fw/categories))]))
