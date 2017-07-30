(ns kii.ui.conf.custom-kll.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]))

(defn custom-kll-comp
  []
  [:div
   [:h3 "Custom KLL"]
   [:p {:style {:font-style "italic"}}
    [:span {:style {:font-variant "small-caps"}} "coming soon"]
    " ಠ_ಠ"]])

(defn custom-kll []
  (let []
    (custom-kll-comp)))