(ns kii.ui.components.settings
  (:require [reagent.core :as r]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [kii.ui.components.home :refer [register-panel]]
            [kii.ui.components.buttons :refer [back-button]]
            [kii.ui.components.manage-canned-animations :refer [manage-canned-animations]]
            [kii.ui.components.toolbar :as toolbar]
            [cljs-react-material-ui.reagent :as mui])
  )

(defn- settings-button [disabled?]
  {:name      :settings
   :component (fn []
                [mui/icon-button
                 {:icon-style {:font-size "36px"}
                  :tooltip    "Settings"
                  :on-click   #(=>> [:panel/set-active :settings])
                  :disabled   disabled?}
                 [mui/font-icon
                  {:class "material-icons md-36"}
                  "settings"]
                 ])})

(defn settings []
  (let [prev-panel (<<= [:panel/previous])]
    (toolbar/add-to-menu (back-button prev-panel false))
    [mui/tabs {:style                  {:width      "100%"
                                        :margin-top "-10px"}
               ;; TODO: Change the default after more than Animations are in
               :initial-selected-index 1}
     [mui/tab {:icon  (r/as-element [mui/font-icon {:class "mdi mdi-account-settings-variant"}])
               :label "Preferences"}
      [:h3 "Nothing here yet..."]
      ]
     [mui/tab {:icon  (r/as-element [mui/font-icon {:class "mdi mdi-movie-roll"}])
               :label "Animations"}
      [manage-canned-animations]
      ]
     [mui/tab {:icon  (r/as-element [mui/font-icon {:class "mdi mdi-folder-download"}])
               :label "Downloads"}

      [:h3 "Nothing here yet..."]
      ]
     ]
    )
  )

(register-panel :settings settings
                :on-deactivate (fn [_ __]
                                 (toolbar/remove-from-menu :back)
                                 (toolbar/add-to-menu (settings-button false)))
                :on-activate (fn [_ __] (toolbar/add-to-menu (settings-button true))))

(toolbar/add-to-menu (settings-button false))
