(ns kii.ui.conf.components
  (:require [kii.ui.conf.impl.components.main]
            [kii.ui.conf.impl.components.assign-visuals]
            [kii.ui.conf.impl.components.keyboard]
            ;; TODO -- Move these to impl.components
            [kii.ui.conf.actions.components]
            [kii.ui.conf.layer-select.components]
            [kii.ui.conf.mode-select.components]
            [kii.ui.conf.key-group.components]
            [kii.ui.conf.subscriptions]
            [kii.ui.conf.config-tabs.components]
            [kii.ui.conf.animation-visualize.components]
            [kii.ui.conf.custom-animation.components]
            ))

(def main #'kii.ui.conf.impl.components.main/main)

(def keyboard #'kii.ui.conf.impl.components.keyboard/keyboard)
