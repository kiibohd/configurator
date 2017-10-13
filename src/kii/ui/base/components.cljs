(ns kii.ui.base.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [cljs-react-material-ui.core :as mui-core]
            [cljs-react-material-ui.reagent :as mui]
            [kii.ui.conf.components]
            [kii.ui.conf.components :as conf]
            [kii.device.keyboard :as keyboard]
            [kii.ui.alert.components :as alert]
            [kii.ui.conf.palette :as palette]
            [kii.ui.util :as util]
            [kii.ui.styling :as styling]
            [clojure.pprint]))

(declare sheet)

;;==== Selected Keyboard Header ====;;
(defn selected-keyboard-comp
  [device]
  (if (nil? device)
    [:div
     [:h2 "Input:Club Configurator"]]
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
  [home-disabled?]
  [:div {:style {:display "inline-flex"}}
   [:button
    {:class    (:btn nav-style)
     :title    "Home"
     :on-click #(rf/dispatch [:nav/home])                   ;; TODO: Warn before navigation.
     :disabled home-disabled?}
    [:i
     {:class (str "material-icons md-36" (if home-disabled? " md-inactive"))}
     "home"]
    ]
   ])

(defn navigation []
  (let [panel (rf/subscribe [:panel/active])]
    (fn []
      (navigation-comp (= @panel :home)))))

;;==== Keyboard Select =====;;
(defn keyboard-display-comp
  [d]
  (let [kbd (keyboard/product->keyboard (:product d))
        layouts (:layouts kbd)
        action (if (= 1 (count layouts))
                 #(util/dispatch-all
                   [:device/set-active d]
                   [:layout/set-active (first layouts)]
                   [:start-configurator]
                   [:panel/set-active :configurator])
                 #(util/dispatch-all
                  [:device/set-active d]
                  [:panel/set-active :choose-layout]))]
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

;;==== Layout Select ====;;
(defstyle ldv-css
  [".layout"
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

  (defn layout-display-visual-comp
    [name {:keys [rows keys]}]
    [:div {:key      (str name)
           :class    (:layout ldv-css)
           :on-click #(util/dispatch-all
                       [:layout/set-active name]
                       [:start-configurator]
                       [:panel/set-active :configurator])}
     [:h3 name]
     [:div {:class (:container ldv-css)
            :style {:height (str (* (+ (last rows) 1) scale) "px")
                    :width  (str (reduce (fn [sum k] (+ sum (* scale (keyword->float k)))) 0 (first keys)) "px")}}
      (map-indexed (fn [i r] (ldv-process-row i r rows)) keys)
      ]]
    ))

(defn layout-display-comp
  [name]
  [:li
   {:key        (str name)
    :class-name (:layout-item sheet)
    :on-click   #(util/dispatch-all
                   [:layout/set-active name]
                   [:start-configurator]
                   [:panel/set-active :configurator])}
   [:span (str name)]
   ])

(defn layout-select-comp
  [device]
  (let [kbd (keyboard/product->keyboard (:product device))
        detail (:layout-detail kbd)]
    (if (nil? detail)
      [:h3 "Select a layout."
       [:ul (map layout-display-comp (:layouts kbd))]]

      [:h3 "Select a Layout"
       [:div
        (map #(layout-display-visual-comp % (get detail %)) (:layouts kbd))
        ]
       ]
      )))

(defn layout-select
  []
  (let [kbd (rf/subscribe [:device/active])]
    (fn []
      (layout-select-comp @kbd))))

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
          (= panel :choose-layout) [layout-select]
          (= panel :choose-activity) [activity-select]
          (= panel :configurator) [conf/main]
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
  [".layout-item"
   {:width            "600px"
    :background-color "palevioletred"
    :list-style       "none"
    :padding          "0.25em"
    :margin           "20px"
    :text-align       "center"}]
  )
