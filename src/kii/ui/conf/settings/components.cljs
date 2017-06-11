(ns kii.ui.conf.settings.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]))

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
     {:outline "none"}]]]
  [".settings"
   {:max-width "30em"}]
  [".define-rows"
   {:display         "flex"
    :flex-wrap       "nowrap"
    :justify-content "space-between"
    :align-items     "center"
    }]
  [".header"
   {:font-weight "600"
    :font-size "20px"}])

(defn on-setting-change
  [setting value]
  (print "Changing" setting "to" (-> value .-target .-value))
  )

(defn on-define-change
  [define value]
  (print "Changing" define "to" (-> value .-target .-value))
  )

(defn defines-comp
  [defines]
  [:div
   [:h2 "Defines"]
   [:div
    [:div {:class (:define-rows css)}
     [:div [:span {:class (:header css)} "Name"]]
     [:div [:span {:class (:header css)} "Value"]]
     ]
    (map (fn [[key value]]
           [:div {:key   (str key)
                  :class (:row css)}
            [:label {:class (:label css)} (name key)]
            [:div {:class (:value css)}
             [:input {:default-value value
                      :on-change #(on-define-change key %)}]
             ]

            ]))
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

