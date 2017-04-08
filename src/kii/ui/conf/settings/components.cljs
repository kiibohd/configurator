(ns kii.ui.conf.settings.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]))

(defstyle css
  [".row"
   {:display "flex"
    :flex-wrap "nowrap"
    :justify-content "space-between"
    :align-items "center"}])

(defn settings-comp
  [headers]
  [:div
   [:h3 "Settings"]
   [:div
    (map (fn [[key value]]
           [:div {:key (str key)
                  :class (:row css)}
            [:label (name key)]
            [:input value]])
         headers)]])

(defn settings []
  (let [headers (rf/subscribe [:conf/headers])]
    (settings-comp @headers)))

