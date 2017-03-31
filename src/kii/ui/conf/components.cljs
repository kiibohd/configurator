(ns kii.ui.conf.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [kii.ui.conf.actions.components]
            [kii.ui.conf.keyboard.components]
            [kii.ui.conf.layer-select.components]
            [kii.ui.conf.key-group.components]
            [kii.ui.conf.subscriptions]))


;;==== Main Configurator Layout ====;;
(defn main-comp []
  [:div
   [kii.ui.conf.actions.components/actions]
   [:div
    [kii.ui.conf.layer-select.components/layer-tabs]
    [kii.ui.conf.keyboard.components/keyboard]
    [kii.ui.conf.key-group.components/key-groups]]])

(defn main
  []
  (let [loaded? (rf/subscribe [:conf/loaded?])]
    (fn []
      (if @loaded?
        (main-comp)
        [:h2 "LOADING... Enhance your calm." ]))))
