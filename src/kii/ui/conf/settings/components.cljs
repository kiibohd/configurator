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
     :min-width "450px"
     :font-weight "300"
     :font-size "16px"}
    ["&:focus"
     {:outline "none"}]]])

(defn on-value-change
  [setting value]
  (print "Changing" setting "to" (-> value .-target .-value))
  )

(defn settings-comp
  [headers]
  [:div
   [:h3 "Settings"]
   [:div {:class (:container css)}
    (map (fn [[key value]]
           [:div {:key (str key)
                  :class (:row css)}
            [:label {:class (:label css)} (name key)]
            [:div {:class (:value css)}
             [:input {:default-value value
                      :on-change #(on-value-change key %)
                      :disabled     (not (contains? #{"Version" "Author" "Date"} (name key)))}]]])
         headers)]])

(defn settings []
  (let [headers (rf/subscribe [:conf/headers])]
    (settings-comp @headers)))

