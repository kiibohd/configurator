(ns kii.ui.conf.components.settings
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.conf.palette :as palette]))

(defstyle css
  [".container"
   {:float "left"}]
  [".row"
   {:display "flex"
    :flex-wrap "nowrap"
    :justify-content "space-between"
    :align-items "center"
    :padding-bottom "10px"}]
  [".label"
   {:padding-right "15px"
    :font-weight "600"
    :font-size "18px"}]
  [".value"
   {:padding "4px"
    :border "1px solid gray"}
   ["&:focus"
    {:border-color "blue"}]
   [:input
    {:border "none"
     :min-width "350px"
     :font-weight "300"
     :font-size "16px"}
    ["&:focus"
     {:outline "none"
      :border-color "blue"}]]]
  [".settings"
   {:max-width "30em"}]
  [".define-rows"
   {:display         "flex"
    :flex-wrap       "nowrap"
    :justify-content "space-between"
    :align-items     "center"
    :padding-bottom "10px"
    }]
  [".header"
   {:font-weight "600"
    :font-size "20px"}]
  [".def-value"
   {:padding "4px"
    :border "1px solid gray"}
   [:input
    {:border "none"
     :min-width "200px"
     :font-weight "300"
     :font-size "16px"}
    ["&:focus"
     {:outline "none"
      :border-color "blue"}]]])


(defn on-setting-change
  [setting value]
  (rf/dispatch-sync [:settings/update setting (-> value .-target .-value)])
  )

;; TODO: Move to self-contained component...
(defstyle icon-style
  [".btn"
   {:background-color "transparent"
    :padding          "0px"
    :border           "none"
    :cursor           "pointer"
    :color            (:darkgray palette/palette)}
   ["&:active:enabled"
    {:outline "0"
     :opacity "0.75"}]
   ["&:focus"
    {:outline "0"}]
   ])

(defn defines-comp
  [defines]
  [:div
   [:h2 "Defines"]
   [:div
    [:div {:class (:define-rows css)}
     [:div [:span {:class (:header css)} "Name"]]
     [:div [:span {:class (:header css)} "Value"]]
     [:div {:style {:display "inline-flex"}}
      [:button
       {:class    (:btn icon-style)
        :title    "Add Define"
        :on-click #(rf/dispatch [:defines/add])}
       [:i
        {:class (str "material-icons md-24")}
        "add_circle_outline"]
       ]]]

    (map (fn [{id :id {:keys [name value]} :data}]
           [:div {:key   id
                  :class (:row css)}
            [:div {:class (:def-value css)}
             [:input
              {:default-value name
               :on-change     #(rf/dispatch-sync [:defines/update
                                                  {:id    id
                                                   :name  (-> % .-target .-value)
                                                   :value value}])}]]
            [:div {:class (:def-value css)}
             [:input
              {:default-value value
               :on-change     #(rf/dispatch-sync [:defines/update
                                                  {:id    id
                                                   :name  name
                                                   :value (-> % .-target .-value)}])}]]
            [:div {:style {:display "inline-flex"}}
             [:button
              {:class    (:btn icon-style)
               :title    "Remove Define"
               :on-click #(rf/dispatch [:defines/remove id])}
              [:i
               {:class (str "material-icons md-24")}
               "remove_circle_outline"]
              ]]
            ])
         defines)
    ]]
  )

(defn settings-comp
  [headers]
  [:div {:class (:settings css)}
   [:h2 "Settings"]
   [:div
    (map (fn [[key value]]
           [:div {:key   (str key)
                  :class (:row css)}
            [:label {:class (:label css)} (name key)]
            [:div {:class (:value css)}
             [:input {:default-value value
                      :on-change     #(on-setting-change key %)
                      :disabled      (not (contains? #{"Version" "Author" "Date"} (name key)))}]]])
         headers)]])

(defn settings []
  (let [headers (rf/subscribe [:conf/headers])
        defines (rf/subscribe [:conf/defines])]
    [:div {:class (:container css)}
     (settings-comp @headers)
     ;;[:br]
     (defines-comp @defines)]
    ))
