(ns kii.ui.conf.impl.components.main
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [kii.ui.conf.actions.components]
            [kii.ui.conf.layer-select.components]
            [kii.ui.conf.mode-select.components]
            [kii.ui.conf.key-group.components]
            [kii.ui.conf.subscriptions]
            [kii.ui.conf.config-tabs.components]
            [kii.ui.conf.animation-visualize.components]
            [kii.ui.conf.custom-animation.components]
            [kii.ui.conf.impl.components.keyboard :refer [keyboard]]
            [kii.ui.conf.impl.components.config-visuals :refer [config-visuals]]
            [kii.ui.conf.impl.components.static-colors :refer [static-colors]]
            [kii.ui.conf.impl.components.customize-canned :refer [customize-canned]]
            ))

(defn main-comp [active-tab mode]
  [:div
   [kii.ui.conf.mode-select.components/mode-select]
   [kii.ui.conf.actions.components/actions]
   (cond
     (= mode :keymap) [:div
                       [kii.ui.conf.layer-select.components/layer-tabs]
                       [keyboard]
                       [:div
                        [kii.ui.conf.config-tabs.components/config-tabs
                         [{:id   :keys
                           :icon "keyboard"
                           :tab  kii.ui.conf.key-group.components/key-groups}
                          {:id   :visuals
                           :icon "lightbulb_outline"
                           :tab config-visuals}
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
                        [kii.ui.conf.animation-visualize.components/visualizer]
                        [:div
                         [kii.ui.conf.config-tabs.components/config-tabs
                          [{:id   :customize-canned
                            :icon "build"
                            :tab  customize-canned}
                           {:id   :custom-animation
                            :icon "code"
                            :tab  kii.ui.conf.custom-animation.components/custom-animation}
                           {:id   :static-leds
                            :icon "color_lens"
                            :tab static-colors}
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
