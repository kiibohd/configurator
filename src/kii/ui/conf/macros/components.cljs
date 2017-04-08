(ns kii.ui.conf.macros.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]))

(defn macros-comp
  []
  [:h3 "Macros"])

(defn macros []
  (let []
    (macros-comp)))

