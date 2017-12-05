(ns kii.ui.components.buttons
  (:require [cljs-react-material-ui.reagent :as mui]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]))

(defn back-button [prev-panel disabled?]
  {:name      :back
   :component (fn []
                [mui/icon-button
                 {:icon-style {:font-size "36px"}
                  :tooltip    "Back"
                  :on-click   #(=>> [:panel/set-active prev-panel])
                  :disabled   disabled?}
                 [mui/font-icon
                  {:class "material-icons md-36"}
                  "arrow_back"]
                 ])})
