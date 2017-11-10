(ns kii.ui.conf.components.animation-visualize
  (:require [reagent.core :as r]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.conf.palette :as palette]
            [kii.device.keyboard :as keyboard]
            [kii.ui.conf.util :as conf-util]
            [kii.util :as u]
            [cuerdas.core :as str])
  )
(defstyle css
  [".backdrop"
   {:background-color (:lightgray palette/palette)
    :border           "1px solid black"}]
  [".keyboard"
   {:position "relative"}]
  [".key"
   {:position "absolute"
    :overflow "hidden"
    }]
  [".selected"
   {:border-color (str/fmt "$red !important" palette/palette)}]
  [".led"
   {:position         "absolute"
    :overflow         "hidden"
    :background-color (:lightgray palette/palette)
    :border           (str/fmt "2px solid $darkgray" palette/palette)
    :border-radius    "2px"}]
  [".base"
   {;:background-color (:lightgray palette/palette)
    :border        (str/fmt "1px solid $gray" palette/palette)
    :border-radius "2px"
    :margin        "2px"}]
  )


(defn keycap
  [key ui-settings]
  (let [sf (:size-factor ui-settings)]
    [:div
     {:class (:key css)
      :style {:left   (* sf (:x key))
              :top    (* sf (:y key))
              :width  (* sf (:w key))
              :height (* sf (:h key))}}
     [:div
      {:class (:base css)
       :style {:width  (- (* sf (:w key)) 6)
               :height (- (* sf (:h key)) 6)}
       }
      ]
     ])
  )

(defn- led-style
  [status]
  (if (nil? status)
    {:border-style "dashed"}
    {:border-style     "solid"
     :background-color (str/fmt "rgb($r, $g, $b)" (:color status))}))

(defn led
  [item status selected? on-click]
  (let [cnv 0.20997375328084 ;; map 19.05mm => 4x4
        csf (<<= [:conf/ui-setting :size-factor])
        sf (<<= [:conf/ui-setting :led-factor])
        scale #(+ (* 2 csf) (* csf (* % cnv)))]
    [:div
     {:class    (str/fmt "%s %s" (:led css) (if selected? (:selected css) ""))
      :style    (merge {:z-index " 2"
                        :left    (- (scale (:x item)) (/ sf 2))
                        :top     (- (scale (:y item)) (/ sf 2))
                        :width   sf
                        :height  sf}
                       (led-style status))
      :on-click #(do (.stopPropagation %) (on-click item %))
      }]
    )
  )

(defn visualizer
  []
  (let [matrix (<<= [:conf/matrix])
        leds (<<= [:conf/leds])
        ui-settings (<<= [:conf/ui-settings])
        selected-leds (<<= [:conf/selected-leds])
        led-statuses (<<= [:conf/led-all-statuses])
        on-click (fn [l e]
                   (let [shift? (.-shiftKey e)
                         set-leds (fn [ls t] (=>> [:conf/set-selected-leds ls t]))]
                     (cond
                       (and (contains? selected-leds (:id l)) shift?) (set-leds (into [] (vals (dissoc selected-leds (:id l)))) :overwrite)
                       shift? (set-leds l :append)
                       :else  (set-leds l :overwrite)))
                   )]
    (let [{:keys [width height]} (conf-util/get-size matrix ui-settings)]
      [:div
       {:class    (:backdrop css)
        :style    {:width   width
                   :height  height
                   :padding (str/fmt "%(backdrop-padding)spx" ui-settings)}
        :on-click #(when (not (.-shiftKey %1))
                     (=>> [:conf/set-selected-leds [] :overwrite]))}
       [:div
        {:class (:keyboard css)
         :style {:width  width
                 :height height}}
        (for [key matrix]
          ^{:key (str/fmt "$board - $code" key)}
          [keycap key ui-settings])
        (for [{id :id :as x} leds]
          ^{:key id}
          [led x (get led-statuses id) (contains? selected-leds id) on-click])
        ]
       ])
    )
  )
