(ns kii.ui.conf.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [kii.ui.conf.actions.components]
            [kii.ui.conf.keyboard.components]
            [kii.ui.conf.layer-select.components]
            [kii.ui.conf.key-group.components]
            [kii.ui.conf.subscriptions]
            [kii.ui.conf.config-tabs.components]))


;;==== Main Configurator Layout ====;;
(defn main-comp [active-tab]
  [:div
   [kii.ui.conf.actions.components/actions]
   [:div
    [kii.ui.conf.layer-select.components/layer-tabs]
    [kii.ui.conf.keyboard.components/keyboard]
    ;; TODO: Move this all out to config-tabs...
    [:div
     [kii.ui.conf.config-tabs.components/config-tabs]
     #_(case active-tab
       :keys [kii.ui.conf.key-group.components/key-groups]
       :settings [:h2 "Settings"]
       :macros [:h2 "Macros"]
       )

     ]]])

(defn main
  []
  (let [loaded? (rf/subscribe [:conf/loaded?])
        active-tab (rf/subscribe [:conf/active-config-tab])]
    (fn []
      (if @loaded?
        (main-comp @active-tab)
        [:h2 "LOADING... Enhance your calm." ]))))
