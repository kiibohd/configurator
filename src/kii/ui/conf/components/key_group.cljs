(ns kii.ui.conf.components.key-group
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.device.keys :as keys]
            [kii.ui.conf.palette :as palette]
            [kii.ui.conf.components.keyboard :as comp-kbd]
            [kii.util :as u]
            [kii.ui.util :as uiu]
            [kii.device.keymap :as keymap]
            ))

(defstyle styles
          [".title"
           {:color "red"
            :font-size "18px"
            :display "inline-block"}]
          [".key-group"
           {:padding-top "10px"
            :clear "both"
            :margin-bottom "10px"}]
          [".container"
           {:display "flex"
            :flex-wrap "wrap"}]
          [".show-hide"
           {:color "black"
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
     {:class (:label comp-kbd/conf-styles)}
     [:spanb
      {:class "fg-layer-0"}
      (u/unescape (or label1 " "))]
     (if label2
       [:span
        {:class "fg-layer-0"}
        (u/unescape label2)])]
    ))

(defn key-comp
  [{:keys [name label] :as key}]
  (let [sf (:size-factor comp-kbd/layout-settings)
        csf (:cap-size-factor comp-kbd/layout-settings)
        ksize (* sf 4)]
    [:div
     {:key name
      :class (:key comp-kbd/conf-styles)
      :style {:width ksize
              :height ksize
              :position "relative"}}
     [:div
      {:class (:base comp-kbd/conf-styles)
       :style {:width  (- ksize 6)
               :height  (- ksize 6)}
       :on-click #(do
                    (.stopPropagation %)
                    (print "Clickey click!"))
       }
      (let [mapped (name keymap/en-us->iec9995)]
        [:div
         {:class (:cap comp-kbd/conf-styles)
          :style {:width  (- ksize 10)
                  :height  (- ksize 12)}}
         (label-comp {:label1 (:label2 mapped)})
         (label-comp {:label1 (or (:label1 mapped) label)})
         (label-comp {})
         ])]
     ])
  )

(defn key-group-comp
  [{:keys [name label]} state]
  (let [ks (sort-by :order
                    (filter #(= name (:group %))
                            (vals keys/predefined)))]
    [:div {:key (str name)
           :class (:key-group styles)}
     [:div {:class (:title styles)}
      [:div {:style {:display "flex" :align-items "center"}}
       [:span label]
       [:span {:class (:show-hide styles)
               :on-click #(rf/dispatch [:toggle-key-group-state name])}
        [:i {:class "material-icons"}
         (if (= state :visible) "arrow_drop_down" "arrow_drop_up")]]
       ]]
     [:div {:class (uiu/->c+s styles :container (if (= state :hidden) :hidden)) }
      (map key-comp ks)]]
    )
  )

(defn key-group
  [{:keys [name] :as group}]
  (let [state (rf/subscribe [:cfg-key-group-state name])]
    (key-group-comp group @state)))

(defn key-groups []
  (let [matrix (rf/subscribe [:cfg-matrix])
        width (:width (comp-kbd/get-size @matrix))]
    [:div {:style {:width width}}
     (doall (map key-group keys/categories))]))
