(ns kii.ui.conf.actions.components
  (:require [reagent.core :as r]
            [cljs-css-modules.macro :as css]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [cuerdas.core :as str]
            [kii.ui.conf.subscriptions]
            [kii.config.core :as config]
            [kii.ui.styling :as styling]
            [kii.ui.conf.palette :as palette]
            [goog.json :as goog-json]
            [cljs-react-material-ui.reagent :as mui]
            [cljs-react-material-ui.icons :as mui-icons]
            [kii.device.keyboard :as keyboard]
            [cljs-time.core :as time]
            [cljs-time.format :as time-fmt]
            [cljs-time.coerce :as time-coerce]
            [cljs-node-io.core :as io]
            [kii.ui.components.popup :refer [popup]]))

;;==== Button ====;;
(css/defstyle btn-style
  [".btn"
   {:margin-right     "10px"
    :background-color "transparent"
    :padding          "0px"
    :border           "none"
    :cursor           "pointer"
    :color            (:darkgray palette/palette)}
   ["&:active:enabled"
    {:outline "0"
     :opacity "0.75"}]
   ["&:focus"
    {:outline "0"}]
   ])

(defn button-comp
  [icon title disabled? action]
  [:button
   {:class    (:btn btn-style)
    :title    title
    :on-click action
    :disabled disabled?}
   [:i
    {:class (str "material-icons md-36" (if disabled? " md-inactive"))}
    icon]])

(defn load-json
  [raw-str]
  (let [json (goog-json/parse raw-str)
        cnv (js->clj json :keywordize-keys true)]
    (>=> [:load-config cnv])
  ))

(defn code-popup [visible? kll]
  (let [mangled (-> kll config/mangle clj->js)]
    [popup "raw layout json" visible? true (.stringify js/JSON mangled nil 4)]
   ))

(defn import-popup [visible?]
  [popup
   "import layout json" visible? false ""
   [{:text "import"
     :fn   #(do
              (load-json %)
              (reset! visible? false)
              (=>> [:alert/add {:type :success :msg "Successfully imported layout!"}]))
     }]])

;;==== Action Bar ====;;
(css/defstyle action-bar-style
  [".action-bar"
   {:display       "flex"
    :float         "right"
    :margin-right  "-10px"
    :margin-bottom "10px"}])

(def short-fmt (time-fmt/formatter "MM/dd ha"))

(defn history
  []
  (let [state (r/atom {:open false :anchor nil})
        ]
    (fn []
      (let [device (<<= [:device/active])
            variant (<<= [:variant/active])
            recent-downloads (<<= [:local/recent-downloads])
            kbd (keyboard/product->keyboard (:product device))
            kbd-name (-> kbd :names first)
            dls (seq (take 5 (get-in recent-downloads [kbd-name variant])))]
        [:div
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
                                                  (=>> [:alert/add {:type :success :msg "Successfully loaded layout!"}])
                                                  )
                                                )}]
             )

           ]
          ]
         ])))
  )


(defn actions []
  (let [code-visible? (r/atom false)
        import-visible? (r/atom false)]
    (fn []
      (let [changes? (<<= [:conf/changes?])
            kll (<<= [:conf/kll])
            current-actions (<<= [:conf/current-actions])]
        [:div
         {:class (:action-bar action-bar-style)}
         [code-popup code-visible? kll]
         [import-popup import-visible?]

         [history]
         [button-comp "help_outline" "Help" false #(=>> [:alert/add {:type :warning :msg "Help not implemented yet :("}])]
         [button-comp "undo" "Revert to original" (not changes?) #(do
                                                                    (>=> [:conf/reset])
                                                                    (=>> [:alert/add {:type :success :msg "Successfully reverted to original!"}]))]
         [button-comp "code" "View layout JSON" false #(reset! code-visible? true)]
         [button-comp "file_upload" "Import keymap" false #(reset! import-visible? true)]
         (if (:firmware-dl current-actions)
           [:div {:style {:height "36px" :width "36px" :margin "1px 10px 1px 0"}}
            [mui/circular-progress {:size 28 :thickness 5}]]
           [button-comp "file_download" "Download firmware" false #(=>> [:start-firmware-compile])])
         ]))
    )
)