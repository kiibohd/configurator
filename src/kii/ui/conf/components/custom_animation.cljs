(ns kii.ui.conf.components.custom-animation
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-react-material-ui.reagent :as mui]
            [kii.ui.styling :as styling]
            [kii.ui.conf.components.animation-selector :refer [animation-selector]]
            [clojure.string :as cstr]))

(def max-width "calc(100% - 2em)")

(defn animation-editor [animation]
  (r/with-let [a (r/atom (cstr/join ";\n" (:frames animation)))]
    (fn [animation]
      [mui/text-field
       {:default-value        @a
        :floating-label-fixed true
        :floating-label-text  "frames — each frame separated by a semi-colon \";\""
        :multi-line           true
        :on-blur              #(rf/dispatch-sync [:conf/partial-update-animation {:frames (cstr/split @a #";\n?")}])
        :on-change            (fn [_ val] (reset! a val))
        :rows                 5
        :rows-max             20
        :style                {:display     "block"
                               :width       max-width
                               :font-family styling/monospace-font-stack}
        :textarea-style       {:white-space    "pre"
                               :padding-bottom "1.2em"
                               :padding-left   "5px"
                               :border-left    "1px solid darkgray"
                               :font-size      "0.9em"}
        }])
    ))

(defn animation-settings
  [animation]
  (r/with-let [a (r/atom (:settings animation))]
    (fn [animation]
      [mui/text-field
       {:floating-label-text "settings"
        :default-value       @a
        :disabled            (nil? animation)
        :on-change           (fn [_ val] (reset! a val))
        :on-blur             #(rf/dispatch-sync [:conf/partial-update-animation {:settings @a}])
        :style               {:display "block"
                              :width   max-width}
        }])
    ))


(defn custom-animation-comp
  [animations selected-animation]
  (let [animation (and selected-animation (selected-animation animations))]
    [:div
     [:h3 "Custom Animations"]
     [animation-selector animations selected-animation]
     (when (some? animation)
       [:div {:key selected-animation}
        [animation-settings animation]
        [animation-editor animation]])
     ]))

(defn custom-animation []
  (let [animations (rf/subscribe [:conf/animations])
        selected-animation (rf/subscribe [:conf/selected-animation])]
    [custom-animation-comp @animations @selected-animation]))
