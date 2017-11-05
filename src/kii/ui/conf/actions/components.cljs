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
            [cljs-node-io.core :as io]))

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


;;==== Code Popup ====;;
;;TODO - Move to another place?
(css/defstyle popup-style
  [".outer-container"
   {:position   "fixed"
    :display         "flex"
    :z-index    "999"
    :width      "100vw"
    :height     "100vh"
    :top        "0"
    :left       "0"
    ;;:text-align "center"
    :background "rgba(0, 0, 0, 0.8)"
    :align-items     "center"
    :justify-content "center"}]
  [".inner-container"
   {:position "relative"
    :height   "80%"
    :width    "80%"
    :padding "25px 25px 25px 20px"
    :background "white"}]
  [".closer"
   {:position      "absolute"
    :top           "-12px"
    :right         "-18px"
    :cursor        "pointer"
    :color         (:darkgray palette/palette)
    :border        (str "1px solid " (:darkgray palette/palette))
    :border-radius "30px"
    :background    "white"
    :font-size     "31px"
    :font-weight   "bold"
    :display       "inline-block"
    :line-height   "0px"
    :padding       "11px 3px"
    :font-family   "serif"}
   [:&:before
    {:content "'×'"}]]
  [".title"
   {:position     "absolute"
    :top          "-12px"
    :left         "10px"
    :border       (str "1px solid " (:darkgray palette/palette))
    :background   (:lightpurple palette/palette)
    :font-weight  "bold"
    :font-variant "small-caps"
    :font-size    "20px"
    :padding      "0 5px 5px 5px"
    }]
  [".text"
   {:width  "100%"
    :height "100%"
    :resize "none"
    :font-size "14px"
    :background "#ECECEC"
    :border (str "1px solid " (:darkgray palette/palette))
    :font-family styling/monospace-font-stack}
   [:&:focus
    {:outline "0"
     }]]
  [".btns"
   {:float "right"
    :margin "2px -25px 0 0"}
   ;;:bottom
   [:button
    {:background (:green palette/palette)
     :border    (str "1px solid " (:darkgray palette/palette))
     :margin "1px 10px 1px 0"
     :padding      "0 10px 5px 10px"
     :font-weight  "bold"
     :font-variant "small-caps"
     :font-size    "18px"
     }]
   ]
  )

(defn popup-comp [title visible? readonly? default-value buttons]
  (let [data (r/atom default-value)]
    (fn [title visible? readonly? default-value buttons]
      (when @visible?
        [:div
         {:class (:outer-container popup-style)}
         [:div
          {:class (:inner-container popup-style)}
          [:span
           {:class (:title popup-style)}
           title]
          [:a
           {:class    (:closer popup-style)
            :on-click #(reset! visible? false)}]
          [:textarea
           {:class         (:text popup-style)
            :read-only     readonly?
            :wrap          "soft"
            :default-value default-value
            :on-change     #(reset! data (-> % .-target .-value))}
           ]
          [:div
           {:class (:btns popup-style)}
           (doall (for [btn buttons]
                    [:button
                     {:key       (:text btn)
                      :class     (:btns popup-style)
                      :on-click  #((:fn btn) @data)}
                     (:text btn)]))
           ]]
         ])))
  )

(defn load-json
  [raw-str]
  (let [json (goog-json/parse raw-str)
        cnv (js->clj json :keywordize-keys true)]
    (>=> [:load-config cnv])
  ))

(defn code-popup [visible? kll]
  (let [mangled (-> kll config/mangle clj->js)]
    [popup-comp "raw layout json" visible? true (.stringify js/JSON mangled nil 4)]
   ))

(defn import-popup [visible?]
  [popup-comp
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
  (let [changes? (<<= [:conf/changes?])
        kll (<<= [:conf/kll])
        code-visible? (r/atom false)
        import-visible? (r/atom false)]
    (fn []
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
       [button-comp "file_download" "Download firmware" false #(=>> [:start-firmware-compile])]
       ])
    )
)