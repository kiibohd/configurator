(ns kii.ui.conf.custom-kll.components
  (:require [reagent.core :as r]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.styling :as styling]
            [kii.ui.mui :as kii-mui]
            [cuerdas.core :as str]))

(defn custom-kll []
  (r/with-let [value (r/atom "")
               active (r/atom nil)]
    (fn []
      (let [active-layer (<<= [:conf/active-layer])
            custom (<<= [:conf/custom-kll])]
        (when (not= @active active-layer)
          (and @active (>=> [:conf/custom-kll @value @active]))
          (reset! active active-layer)
          (reset! value custom))
        [:div
         [kii-mui/text-field
          {:value                @value
           :floating-label-fixed true
           :floating-label-text  "Custom KLL"
           :disabled             false
           :multi-line           true
           :rows                 4
           :rowsMax              20
           :on-change            (fn [_ val] (reset! value val))
           :on-blur              #(and (= active-layer @active)
                                       (>=> [:conf/custom-kll @value active-layer]))
           :style                {:display     "block"
                                  :width       "calc(100% - 2em)"
                                  :font-family styling/monospace-font-stack
                                  }
           :textarea-style       {:white-space    "pre"
                                  :padding-bottom "1.2em"
                                  :padding-left   "5px"
                                  :border-left    "1px solid darkgray"
                                  :color          "black"
                                  :font-size      "1em"}
           :floating-label-style {:font-size "24px"}}
          ]
         ]
        ))))