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
            [kii.ui.conf.animation-visualize.components]
            [kii.ui.conf.custom-animation.components]))

;;==== Main Configurator Layout ====;;
(defn main-comp [active-tab mode]
  [:div
   [kii.ui.conf.mode-select.components/mode-select]
   [kii.ui.conf.actions.components/actions]
   (cond
     (= mode :keymap) [:div
                       [kii.ui.conf.layer-select.components/layer-tabs]
                       [kii.ui.conf.keyboard.components/keyboard]
                       [:div
                        [kii.ui.conf.config-tabs.components/config-tabs
                         [{:id   :keys
                           :icon "keyboard"
                           :tab  kii.ui.conf.key-group.components/key-groups}
                          {:id   :settings
                           :icon "settings"
                           :tab  kii.ui.conf.settings.components/settings}
                          {:id   :macros
                           :icon "videocam"
                           :tab  kii.ui.conf.macros.components/macros}
                          {:id   :custom-kll
                           :icon "code"
                           :tab  kii.ui.conf.custom-kll.components/custom-kll}]]]]
     (= mode :visuals) [:div {:style {:clear "both"}}
                        [:div {:style {:height "36px"}}]
                        [kii.ui.conf.animation-visualize.components/keyboard]
                        [:div
                         [kii.ui.conf.config-tabs.components/config-tabs
                          [{:id   :custom-animation
                            :icon "code"
                            :tab  kii.ui.conf.custom-animation.components/custom-animation}
                           ]]]]
     :else [:div])

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
