(ns kii.ui.conf.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [kii.ui.conf.actions.components]
            [kii.ui.conf.keyboard.components]
            [kii.ui.conf.layer-select.components]
            [kii.ui.conf.mode-select.components]
            [kii.ui.conf.key-group.components]
            [kii.ui.conf.subscriptions]
            [kii.ui.conf.config-tabs.components]
            [kii.ui.conf.animation-visualize.components]))


;;==== Main Configurator Layout ====;;
(defn main-comp [active-tab mode]
  [:div
   [kii.ui.conf.mode-select.components/mode-select]
   [kii.ui.conf.actions.components/actions]
   (if (= mode :keymap)
     [:div
      [kii.ui.conf.layer-select.components/layer-tabs]
      [kii.ui.conf.keyboard.components/keyboard]
      [:div
       [kii.ui.conf.config-tabs.components/config-tabs]
       ]]
     [:div {:style {:clear "both" }}
      [:div {:style {:height "36px"}}]
      [kii.ui.conf.animation-visualize.components/keyboard]]
     )
   ]
  )

(defn main
  []
  (let [loaded? (rf/subscribe [:conf/loaded?])
        active-tab (rf/subscribe [:conf/active-config-tab])
        mode (rf/subscribe [:conf/mode])]
    (fn []
      (if @loaded?
        [main-comp @active-tab @mode]
        [:h2 "LOADING... Enhance your calm." ]))))
