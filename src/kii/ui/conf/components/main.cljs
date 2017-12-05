(ns kii.ui.conf.components.main
  (:require [reagent.core :as r]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
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
            [kii.ui.components.home :refer [register-panel]]
            [kii.config.core :as config]
            [kii.ui.components.popup :refer [popup]]
            [cljs-react-material-ui.reagent :as mui]
            [kii.ui.components.toolbar :as toolbar]
            [cljs-node-io.core :as io]
            [cljs-time.format :as time-fmt]
            [cljs-time.core :as time]
            [cljs-time.coerce :as time-coerce]
            [cuerdas.core :as str]
            [cljs-react-material-ui.icons :as mui-icons]
            [kii.device.keyboard :as keyboard]))

(defn keymap []
  [:div
   [kii.ui.conf.layer-select.components/layer-tabs]
   [keyboard]
   [:div
    [kii.ui.conf.components.config-tabs/config-tabs
     [{:id   :keys
       :icon "keyboard"
       :tab  kii.ui.conf.key-group.components/key-groups}
      {:id   :visuals
       :icon "lightbulb_outline"
       :tab  config-visuals}
      {:id   :settings
       :icon "settings"
       :tab  kii.ui.conf.components.settings/settings}
      {:id   :macros
       :icon "videocam"
       :tab  kii.ui.conf.components.macros/macros}
      {:id   :custom-kll
       :icon "code"
       :tab  kii.ui.conf.custom-kll.components/custom-kll}]]]])

(defn visuals []
  [:div {:style {:clear "both"}}
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
       :tab  static-colors}]]]])

(defn help-button []
  [:div
   [mui/icon-button
    {:icon-style {:font-size "36px"}
     :tooltip    "Help"
     :on-click   #(=>> [:alert/add {:type :warning :msg "Help not implemented yet :("}])
     :disabled   false}
    [mui/font-icon
     {:class "material-icons md-36"}
     "help_outline"]
    ]])

(defn load-json
  [raw-json]
  (if-let [cnv (config/json->config raw-json)]
    (do (>=> [:load-config cnv]) true)
    false))

(defn history-button []
  (let [state (r/atom {:open false :anchor nil})
        short-fmt (time-fmt/formatter "MM/dd ha")]
    (fn []
      (let [device (<<= [:device/active])
            variant (<<= [:variant/active])
            recent-downloads (<<= [:local/recent-downloads])
            kbd (keyboard/product->keyboard (:product device))
            kbd-name (-> kbd :names first)
            dls (seq (take 5 (get-in recent-downloads [kbd-name variant])))]
        [:div {:style {:margin-top "10px"}}
         [mui/raised-button
          {:style    {:display "inline-block" :margin-right "10px"}
           :on-click #(do (.preventDefault %)
                          (reset! state {:open true :anchor (.-currentTarget %)}))
           :label    "layouts"
           :icon     (mui-icons/action-history)}
          ]
         [mui/popover
          {:open             (:open @state)
           :anchorEl         (:anchor @state)
           :anchor-origin    {:horizontal "left" :vertical "bottom"}
           :target-origin    {:horizontal "left" :vertical "top"}
           :on-request-close #(reset! state {:open false :anchor nil})}
          [mui/menu
           (for [layout (get-in kbd [:layouts variant])]
             ^{:key layout}
             [mui/menu-item {:primary-text (str/title layout)
                             :on-click     #(do (reset! state {:open false :anchor nil})
                                                (>=> [:layout/set-active layout])
                                                (=>> [:start-configurator])
                                                )}])
           (if dls [mui/divider])
           (for [dl dls]
             ^{:key dl}
             [mui/menu-item {:primary-text (str/fmt "%s (%s) - %s"
                                                    (:layout dl)
                                                    (subs (:hash dl) 0 5)
                                                    (->> dl :time time-coerce/from-long time/to-default-time-zone (time-fmt/unparse short-fmt))
                                                    )
                             :on-click     #(do (reset! state {:open false :anchor nil})
                                                (let [raw-str (io/slurp (:json dl))]
                                                  (load-json raw-str)
                                                  (=>> [:alert/add {:type :success :msg "Successfully loaded layout!"}])))
                             }])]]]))))

(defn view-raw-json [visible?]
  (let [kll (<<= [:conf/kll])
        mangled (-> kll config/mangle clj->js)]
    [popup "raw layout json" visible? true (.stringify js/JSON mangled nil 4)]))

(defn view-raw-json-button []
  (let [visible? (r/atom false)]
    (fn []
      [:div
       [view-raw-json visible?]
       [mui/icon-button
        {:icon-style {:font-size "36px"}
         :tooltip    "View Raw JSON"
         :on-click   #(reset! visible? true)
         :disabled   false}
        [mui/font-icon
         {:class "material-icons md-36"}
         "code"]
        ]])))

(defn revert-button []
  (let [changes? (<<= [:conf/changes?])]
    [:div
     [mui/icon-button
      {:icon-style {:font-size "36px"}
       :tooltip    "Revert to original"
       :on-click   #(do (>=> [:conf/reset])
                        (=>> [:alert/add {:type :success :msg "Successfully reverted to original!"}]))
       :disabled   (not changes?)}
      [mui/font-icon
       {:class "material-icons md-36"}
       "undo"]
      ]]) )


(defn import-popup [visible?]
  [popup
   "import layout json" visible? false ""
   [{:text "import"
     :fn   (fn [val]
             (if (load-json val)
               (=>> [:alert/add {:type :success :msg "Successfully imported layout!"}])
               (=>> [:alert/add {:type :error :msg "Could not import, invalid format."}]))
             (reset! visible? false))
     }]])

(defn import-button []
  (let [visible? (r/atom false)]
    (fn []
      [:div
       [import-popup visible?]
       [mui/icon-button
        {:icon-style {:font-size "36px"}
         :tooltip    "Import keymap"
         :on-click   #(reset! visible? true)
         :disabled   false}
        [mui/font-icon
         {:class "material-icons md-36"}
         "file_upload"]
        ]])))


(defn download-button []
  (let [current-actions (<<= [:conf/current-actions])
        active? (some? (:firmware-dl current-actions))]
    [:div
     (if active?
       [mui/icon-button
        [mui/circular-progress {:size 28 :thickness 3}]]

       [mui/icon-button
        {:icon-style {:font-size "36px"}
         :tooltip    "Download firmware"
         :on-click   #(=>> [:start-firmware-compile])
         :disabled   false}
        [mui/font-icon
         {:class "material-icons md-36"}
         "flash_on"]
        ])]) )

(defn loading []
  [:h2 "LOADING... Enhance your calm."])

(defn configurator []
  (let [loaded? (<<= [:conf/loaded?])
        active-tab (<<= [:conf/active-config-tab])
        mode (<<= [:conf/mode])]
    [:div {:style {:display "inline-block"}}
     (cond
       (= mode :keymap) [keymap]
       (= mode :visuals) [visuals]
       :else [:div])
     ]))

(defn main []
  (let [loaded? (<<= [:conf/loaded?])]
    (if-not loaded?
      [loading]
      [configurator])))


(register-panel :configurator main
                :on-activate (fn [_ __]
                               (toolbar/add-to-menu
                                {:name      :mode-select
                                 :component kii.ui.conf.components.mode-select/mode-select}
                                {:name      :history
                                 :component history-button}
                                {:name      :help
                                 :component help-button}
                                {:name      :revert
                                 :component revert-button }
                                {:name      :view-raw-json
                                 :component view-raw-json-button}
                                {:name      :import
                                 :component import-button}
                                {:name      :download
                                 :component download-button}
                                )
                               )
                :on-deactivate (fn [_ __]
                                 (toolbar/remove-from-menu :mode-select :history :help :revert
                                                           :view-raw-json :import :download)))
