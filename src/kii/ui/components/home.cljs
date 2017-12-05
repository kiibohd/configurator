(ns kii.ui.components.home
  (:require [reagent.core :as r]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [cljs-react-material-ui.reagent :as mui]
            [cljs-react-material-ui.core :as mui-core]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.ui.styling :as styling]
            [kii.ui.components.toolbar :refer [toolbar]]
            [kii.ui.alert.components :as alert]
            [kii.ui.components.selected-keyboard :refer [selected-keyboard]]))

(defstyle css
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
  )

(def panels (atom {}))

(defn register-panel
  [name component & {:keys [on-activate on-deactivate]
                     :or   {on-activate   (constantly nil)
                            on-deactivate (constantly nil)}}]
  (swap! panels assoc name {:component     component
                            :on-activate   on-activate
                            :on-deactivate on-deactivate}))

(defn home []
  (r/with-let [active (r/atom nil)]
    (fn []
      (let [panel (<<= [:panel/active])
            initialized? (<<= [:initialized?])]
        (when (not= @active panel)
          (let [deactivate (:on-deactivate (get @panels @active))
                activate (:on-activate (get @panels panel))]
            (when deactivate (deactivate @active panel))
            (when activate (activate panel @active))
            (reset! active panel)))
        [mui/mui-theme-provider
         {:mui-theme (mui-core/get-mui-theme
                      {:font-family styling/font-stack
                       :palette     {:primary1-color (mui-core/color :deep-purple400)
                                     :primary2-color (mui-core/color :deep-purple600)}})}
         (if initialized?
           [:div {:class (:main-container css)}
            [:div {:style {:display "flex" :justify-content "space-between" :align-items "center"}}
             [selected-keyboard]
             [toolbar]]
            [:hr]
            [:div
             [alert/alert-popover]
             [:div {:style {:clear "both"}}
              (if-let [p (get @panels panel)]
                [(:component p)]
                [:h3 "Unknown Panel!"]
                )
              ]]]
           [:div
            [:h3 "Initializing..."]]
           )]))))

