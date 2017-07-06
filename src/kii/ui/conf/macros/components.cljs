(ns kii.ui.conf.macros.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]))

(defn macros-comp
  []
  [:div
   [:h3 "Macros"]
   [:p {:style {:font-style "italic"}}
    [:span {:style {:font-variant "small-caps"}} "coming soon"]
    " ಠ_ಠ"]])

(defn macros []
  (let []
    (macros-comp)))

