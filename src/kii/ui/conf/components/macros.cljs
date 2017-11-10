(ns kii.ui.conf.components.macros
  (:require [reagent.core :as r]
            [re-frame.core :as rf]))

(defn macros []
  (fn []
    [:div
     [:h3 "Macros"]
     [:p {:style {:font-style "italic"}}
      [:span {:style {:font-variant "small-caps"}} "coming soon"]
      " ಠ_ಠ"]]))

