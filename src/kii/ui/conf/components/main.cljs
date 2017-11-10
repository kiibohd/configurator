(ns kii.ui.conf.components.main
  (:require [reagent.core :as r]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [kii.ui.conf.actions.components]
            [kii.ui.conf.layer-select.components]
            [kii.ui.conf.components.mode-select]
            [kii.ui.conf.key-group.components]
            [kii.ui.conf.subscriptions]
            [kii.ui.conf.components.config-tabs]
            [kii.ui.conf.components.animation-visualize]
            [kii.ui.conf.components.custom-animation]
            [kii.ui.conf.components.keyboard :refer [keyboard]]
            [kii.ui.conf.components.config-visuals :refer [config-visuals]]
            [kii.ui.conf.components.static-colors :refer [static-colors]]
            [kii.ui.conf.components.customize-canned :refer [customize-canned]]
            [kii.ui.conf.components.manage-animations :refer [manage-animations]]
            ))

(defn main
  []
  (let [loaded? (<<= [:conf/loaded?])
        active-tab (<<= [:conf/active-config-tab])
        mode (<<= [:conf/mode])]
    (if-not loaded?
      [:h2 "LOADING... Enhance your calm."]
      [:div
       [kii.ui.conf.components.mode-select/mode-select]
       [kii.ui.conf.actions.components/actions]
       (cond
         (= mode :keymap) [:div
                           [kii.ui.conf.layer-select.components/layer-tabs]
                           [keyboard]
                           [:div
                            [kii.ui.conf.components.config-tabs/config-tabs
                             [{:id   :keys
                               :icon "keyboard"
                               :tab  kii.ui.conf.key-group.components/key-groups}
                              {:id   :visuals
                               :icon "lightbulb_outline"
                               :tab config-visuals}
                              {:id   :settings
                               :icon "settings"
                               :tab  kii.ui.conf.components.settings/settings}
                              {:id   :macros
                               :icon "videocam"
                               :tab  kii.ui.conf.components.macros/macros}
                              {:id   :custom-kll
                               :icon "code"
                               :tab  kii.ui.conf.custom-kll.components/custom-kll}]]]]
         (= mode :visuals) [:div {:style {:clear "both"}}
                            [:div {:style {:height "36px"}}]
                            [kii.ui.conf.components.animation-visualize/visualizer]
                            [:div
                             [kii.ui.conf.components.config-tabs/config-tabs
                              [{:id   :manage-animations
                                :icon "settings"
                                :tab  manage-animations}
                               {:id   :customize-canned
                                :icon "build"
                                :tab  customize-canned}
                               {:id   :custom-animation
                                :icon "code"
                                :tab  kii.ui.conf.components.custom-animation/custom-animation}
                               {:id   :static-leds
                                :icon "color_lens"
                                :tab static-colors}
                               ]]]]
         :else [:div])
       ]
      )))
