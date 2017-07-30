(ns kii.ui.conf.actions.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :as css]
            [kii.ui.conf.subscriptions]
            [kii.config.core :as config]
            [kii.ui.conf.palette :as palette]
            [clojure.pprint]
            [goog.json :as goog-json]
            ))

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
    :border (str "1px solid " (:darkgray palette/palette))}
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

(defn code-popup [visible? kll]
  (let [mangled (-> kll config/mangle clj->js)]
    [popup-comp "raw layout json" visible? true (.stringify js/JSON mangled nil 4)]
   ))

(defn import-popup [visible?]
  [popup-comp
   "import layout json" visible? false ""
   [{:text "import"
     :fn   #(let [json (goog-json/parse %)
                  cnv (js->clj json :keywordize-keys true)]
              (rf/dispatch-sync [:load-config cnv])
              (reset! visible? false)
              (rf/dispatch [:alert/add {:type :success :msg "Successfully imported layout!"}]))
     }]])

;;==== Action Bar ====;;
(css/defstyle action-bar-style
  [".action-bar"
   {:float         "right"
    :margin-right  "-10px"
    :margin-bottom "10px"}])

(defn actions-comp
  [changes? kll]
  (let [code-visible? (r/atom false)
        import-visible? (r/atom false)]
    (fn [changes? kll]
      [:div
       {:class (:action-bar action-bar-style)}
       (code-popup code-visible? kll)
       (import-popup import-visible?)
       (button-comp "help_outline" "Help" false #(rf/dispatch [:alert/add {:type :warning :msg "Help not implemented yet :("}]))
       (button-comp "undo" "Revert to original" changes? #(print "Revert clicked!"))
       (button-comp "code" "View layout JSON" false #(reset! code-visible? true))
       (button-comp "file_upload" "Import keymap" false #(reset! import-visible? true))
       (button-comp "file_download" "Download firmware" false #(rf/dispatch [:start-firmware-compile]))
       ])))

(defn actions []
  (let [changes? (rf/subscribe [:conf/changes?])
        kll (rf/subscribe [:conf/kll])]
    [actions-comp @changes? @kll]))
