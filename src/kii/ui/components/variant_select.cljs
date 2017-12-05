(ns kii.ui.components.variant-select
  (:require [reagent.core :as r]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.device.keyboard :as keyboard]
            [kii.ui.components.home :refer [register-panel]]))

(defstyle css
  [".variant"
   {:cursor        "pointer"
    :border        "1px solid gray"
    :border-radius "4px"
    :padding       "1em"
    :margin        "2em 0 0 1em"}
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
    :border-radius "2px"}]
  [".dcap"
   {:margin        "1px"
    :border        "1px solid red"
    :border-radius "2px"}]
  [".variant-item"
   {:width            "600px"
    :background-color "palevioletred"
    :list-style       "none"
    :padding          "0.25em"
    :margin           "20px"
    :text-align       "center"}]
  )

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
                          :class (:key css)
                          :style {:width  (str width "px")
                                  :height (str height "px")
                                  :top    (str (* height (nth rows row-idx)) "px")
                                  :left   (str left "px")}}
                    (when (not= :space key-type)
                      [:div {:class (if (= :diff key-type) (:dcap css) (:cap css))
                             :style {:width  (str (- width 4) "px")
                                     :height (str (- height 4) "px")}}])]]
          (recur ks (+ left width) (conj result elem))))
      ))

  (defn variant-display-visual-comp
    [kbd name {:keys [rows keys]}]
    [:div {:key      (str name)
           :class    (:variant css)
           :on-click #(do
                        (>=> [:variant/set-active name])
                        (>=> [:layout/set-active (first (get-in kbd [:layouts name]))])
                        (=>> [:start-configurator true])
                        (=>> [:panel/set-active :configurator]))
           }
     [:h3 name]
     [:div {:class (:container css)
            :style {:height (str (* (+ (last rows) 1) scale) "px")
                    :width  (str (reduce (fn [sum k] (+ sum (* scale (keyword->float k)))) 0 (first keys)) "px")}}
      (map-indexed (fn [i r] (ldv-process-row i r rows)) keys)
      ]]
    ))


(defn variant-select []
  (let [device (<<= [:device/active])]
    (fn []
      (let [kbd (keyboard/product->keyboard (:product device))
            detail (:variant-detail kbd)]
        [:div {:style {:display "inline-block"}}
         (if (nil? detail)
           [:h3 "Select a variant."
            [:ul
             (for [name (:variants kbd)]
               ^{:key name}
               [:li
                {:class    (:variant-item css)
                 :on-click #(do
                              (>=> [:variant/set-active name])
                              (>=> [:layout/set-active (first (get-in kbd [:layouts name]))])
                              (=>> [:start-configurator true])
                              (=>> [:panel/set-active :configurator]))}
                [:span (str name)]])]]
           [:h3 "Select a Variant"
            [:div
             (for [variant (:variants kbd)]
               ^{:key variant}
               [variant-display-visual-comp kbd variant (get detail variant)])
             ]
            ]
           )])
      )))

(register-panel :choose-variant variant-select)
