(ns kii.ui.components.base
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [cljs-react-material-ui.core :as mui-core]
            [cljs-react-material-ui.reagent :as mui]
            [kii.ui.conf.components.main :as conf-main]
            [kii.device.keyboard :as keyboard]
            [kii.ui.alert.components :as alert]
            [kii.ui.components.flash :refer [flash-firmware]]
            [kii.ui.conf.palette :as palette]
            [kii.ui.util :as util]
            [kii.ui.styling :as styling]))

(declare sheet)

;;==== Selected Keyboard Header ====;;
(defn selected-keyboard-comp
  [device]
  (if (nil? device)
    [:div
     [:h2 "Kiibohd Configurator"]]
    (let [kbd (keyboard/product->keyboard (:product device))]
      [:div
       [:h2 (str (:manufacturer device) " - "
                 (:display kbd)
                 (if (keyboard/flashable? device)
                   " (Ready to Flash)"))]])))

(defn selected-keyboard []
  (let [kbd (rf/subscribe [:device/active])]
    (fn []
      (selected-keyboard-comp @kbd))))

;;=== Navigation Header ===;;
(defstyle nav-style
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
(defn navigation-comp
  [active-panel]
  [:div {:style {:display "inline-flex"}}
   [:button
    {:class    (:btn nav-style)
     :title    "Flash"
     :on-click #(rf/dispatch [:panel/set-active :flash])                   ;; TODO: Warn before navigation.
     :disabled (= active-panel :flash)
     }
    [:i
     {:class (str "material-icons md-36" (if (= active-panel :flash) " md-inactive"))}
     "flash_on"]
    ]
   [:button
    {:class    (:btn nav-style)
     :title    "Home"
     :on-click #(rf/dispatch [:nav/home])                   ;; TODO: Warn before navigation.
     :disabled (= active-panel :home)}
    [:i
     {:class (str "material-icons md-36" (if (= active-panel :home) " md-inactive"))}
     "home"]
    ]
   ])

(defn navigation []
  (let [panel (rf/subscribe [:panel/active])]
    (fn []
      (navigation-comp @panel))))

;;==== Keyboard Select =====;;
(defn keyboard-display-comp
  [d]
  (let [kbd (keyboard/product->keyboard (:product d))
        variants (:variants kbd)
        action (if (= 1 (count variants))
                 ;; TODO - This needs to get refactored out 3 places now initiate conf mode
                 #(do
                    (>=> [:device/set-active d])
                    (>=> [:variant/set-active (first variants)])
                    (>=> [:layout/set-active (first (get-in kbd [:layouts (first variants)]))])
                    (=>> [:start-configurator])
                    (=>> [:panel/set-active :configurator]))
                 #(util/dispatch-all
                   [:device/set-active d]
                   [:panel/set-active :choose-variant]))]
    [:a
     {:key      (:path d)
      :class    (:kbd-item sheet)
      :on-click action}
     [:img {:src (str "img/" (:image kbd))
            :alt (:display kbd)
            :title (:display kbd)
            :height "200px"
            :width "200px"}]
     ]))

(defn keyboard-select-comp
  [devices]
  (let [[connected disconnected] ((juxt filter remove) #(true? (:connected %)) devices)]
    [:div
     [:h3 "Connected Devices"]
     [:div
      (if (empty? connected)
        [:span {:style {:margin-left "4em" :font-style "italic" :font-size "1.25em"}} "None"]
        (map keyboard-display-comp connected))]
     (when-not (empty? disconnected)
       [:div
        [:br]
        [:h3 "Disconnected Devices"]
        [:div
         (map keyboard-display-comp disconnected)]])]))

(defn keyboard-select
  []
  (let [devices (rf/subscribe [:device/all])]
    (fn [] (keyboard-select-comp @devices))))

;;==== Variant Select ====;;
(defstyle ldv-css
  [".variant"
   {:cursor "pointer"
    :border "1px solid gray"
    :border-radius "4px"
    :padding "1em"
    :margin "2em 0 0 1em"}
   [:h3 {:margin "0 0 0.5em 0"}]]
  [".container"
   {:position "relative"
    }]
  [".key"
   {:position "absolute"}
   ]
  [".cap"
   {:margin        "1px"
    :border        "1px solid black"
    :border-radius "2px"} ]
  [".dcap"
   {:margin "1px"
    :border        "1px solid red"
    :border-radius "2px"}])

(let [scale 32]
  (defn keyword->float
    [k]
    (js/parseFloat (name k)))

  (defn key-type [k]
    (case (last (name k))
      "d" :diff
      "s" :space
      :key))

  (defn ldv-process-row
    [row-idx row rows]
    (loop [[k & ks] row
           left 0
           result [:div {:key (str row-idx)}]]
      (if (nil? k)
        result
        (let [size (keyword->float k)
              key-type (key-type k)
              width (* scale size)
              height scale
              elem [:div {:key   (str row-idx "-" left)
                          :class (:key ldv-css)
                          :style {:width  (str width "px")
                                  :height (str height "px")
                                  :top    (str (* height (nth rows row-idx)) "px")
                                  :left   (str left "px")}}
                    (when (not= :space key-type)
                      [:div {:class (if (= :diff key-type) (:dcap ldv-css) (:cap ldv-css))
                             :style {:width  (str (- width 4) "px")
                                     :height (str (- height 4) "px")}}])]]
          (recur ks (+ left width) (conj result elem))))
      )
    )

  (defn variant-display-visual-comp
    [kbd name {:keys [rows keys]}]
    [:div {:key      (str name)
           :class    (:variant ldv-css)
           :on-click #(do
                        (>=> [:variant/set-active name])
                        (>=> [:layout/set-active (first (get-in kbd [:layouts name]))])
                        (=>> [:start-configurator])
                        (=>> [:panel/set-active :configurator]))
           }
     [:h3 name]
     [:div {:class (:container ldv-css)
            :style {:height (str (* (+ (last rows) 1) scale) "px")
                    :width  (str (reduce (fn [sum k] (+ sum (* scale (keyword->float k)))) 0 (first keys)) "px")}}
      (map-indexed (fn [i r] (ldv-process-row i r rows)) keys)
      ]]
    )
  )


(defn variant-select
  []
  (let [device (<<= [:device/active])]
    (fn []
      (let [kbd (keyboard/product->keyboard (:product device))
            detail (:variant-detail kbd)]
        (if (nil? detail)
          [:h3 "Select a variant."
           [:ul
            (for [name (:variants kbd)]
              ^{:key name}
              [:li
               {:class    (:variant-item sheet)
                :on-click #(do
                             (>=> [:variant/set-active name])
                             (>=> [:layout/set-active (first (get-in kbd [:layouts name]))])
                             (=>> [:start-configurator])
                             (=>>[:panel/set-active :configurator]))}
               [:span (str name)] ] ) ] ]
          [:h3 "Select a Variant"
           [:div
            (for [variant (:variants kbd)]
              ^{:key variant}
             [variant-display-visual-comp kbd variant (get detail variant)] )
            ]
           ]
          ))
      )))

;;==== Activity Select ====;;
;;XXXX DISABLED XXXX;;
(defn activity-select
  []
  [:div {:style {:width "80vw" :margin "20px"}}
   [:h3 "What do you want to do?"
    [:ul
     [:li
      {:on-click #(util/dispatch-all
                   [:start-configurator]
                   [:panel/set-active :configurator])}
      "Configure"]
     [:li "Flash"]]]])

;;==== Base Layout =====;;
(defn base-layout-comp
  [initialized? panel]
  [mui/mui-theme-provider
   {:mui-theme (mui-core/get-mui-theme
                {:font-family styling/font-stack
                 :palette {:primary1-color (mui-core/color :deep-purple400)
                           :primary2-color (mui-core/color :deep-purple600)}})}
   (if initialized?
     [:div {:class (:main-container sheet)}
      [:div {:style {:display "flex" :justify-content "space-between"}}
       [selected-keyboard]
       [navigation]]
      [:hr]
      [:div {:style {:display "inline-block"}}
       [alert/alert-popover]
       [:div {:style {:clear "both"}}
        (cond
          (= panel :home) [keyboard-select]
          (= panel :choose-variant) [variant-select]
          (= panel :choose-activity) [activity-select]
          (= panel :configurator) [conf-main/main]
          (= panel :flash) [flash-firmware]
          :else [:h3 "Unknown Panel!"])]]]
     [:div
      [:h3 "Initializing..."]]
     )])

(defn base-layout []
  (let [panel (rf/subscribe [:panel/active])
        initialized? (rf/subscribe [:initialized?])]
    [base-layout-comp @initialized? @panel]))

;;==== Base Stylesheet ====;;

(defstyle
  sheet
  [:html
   {:height "100%"}]
  [:body
   {:background-color       "white"
    :padding                "0 20px"
    :font-family            styling/font-stack
    :font-weight            "500"
    :-webkit-font-smoothing "antialiased"}
   [:textarea
    {:font-family            styling/font-stack
     :font-weight            "500"
     :-webkit-font-smoothing "antialiased"}]
   [:button
    {:font-family            styling/font-stack
     :font-weight            "500"
     :-webkit-font-smoothing "antialiased"}]]
  [".main-container"
   {:display      "inline-block"
    :min-width    "100%"
    :margin-right "20px"}]
  [:a {:text-decoration "none"}]
  (do [[".material-icons.md-48"
        {:font-size "48px"}]
       [".material-icons.md-36"
        {:font-size "36px"}]
       [".material-icons.md-inactive"
        {:opacity "0.3"}]])
  [".kbd-item"
   {:cursor           "pointer"
    :margin           "20px"
    :padding          "0.25em"}]
  [".variant-item"
   {:width            "600px"
    :background-color "palevioletred"
    :list-style       "none"
    :padding          "0.25em"
    :margin           "20px"
    :text-align       "center"}]
  )
