(ns kii.ui.conf.impl.components.customize-canned
  (:require [reagent.core :as r]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [cljs-react-material-ui.reagent :as mui]
            [cuerdas.core :as str]
            [cljs.pprint]
            [kii.ui.color-picker :as color-picker]))

;;TODO - Don't allow overwrite of same animation.
;;TODO - Fix customization -- color and speed?

(defn- replace-all
  [string values]
  (reduce (fn [s [k v]]
            (str/replace s (str "${" k "}") v))
          string
          values))

(defn- customization
  [vals! {:keys [name type default values] :as entry}]
  (case type
    "select" [mui/select-field
              {:floating-label-text name
               :value               (get @vals! name)
               :on-change           (fn [o k v]
                                      (js/console.log v)
                                      (swap! vals! assoc name v))
               }
              (for [{:keys [name value]} values]
                [mui/menu-item {:key          name
                                :value        value
                                :primary-text name}])]
    "color" [color-picker/chrome
             {:disable-alpha true
              :color         (clj->js (get @vals! name))
              :on-change     #(let [c (js->clj %1 :keywordize-keys true)]
                                (swap! vals! assoc name (:rgb c)))
              }]

    :else [:h5 "Unknown customization..."]
    )
  )

(defn- customize-card
  [selected! animation]
  (r/with-let [name (r/atom @selected!)
               values (r/atom (into {} (map (fn [x] [(:name x) (:default x)]) (:configurable animation))))]
    (cljs.pprint/pprint (:configurable animation))
    [:div
     [mui/card
      {:style {:min-width "35em"
               :margin-left "2em"
               :margin-top "1em"}}
      [mui/card-text
       [mui/text-field {:floating-label-text "name to create as"
                        :default-value @name
                        :on-change (fn [_ val] (reset! name val))
                        }]]
      [mui/card-text
       (:description animation)
       ]
      [:hr {:style {:margin "0 10px"}}]
      [mui/card-header {:text-style {:padding-right "0" }
                        :style {:padding-bottom "0"}}
       "customizations"]
      (if (count (:configurable animation))
        [mui/card-text
         {:style {}}
         (for [c (:configurable animation)]
           ^{:key (:name c)}
           [customization values c])]
        [mui/card-text {:style {:font-style "italic" :padding-top "0"}}
         "none"])
      [mui/card-actions
       [mui/raised-button
        {:label    "Add Animation"
         :primary  true
         :on-click (fn []
                     (=>> [:conf/add-animation (keyword @name)
                           {:settings (replace-all (:settings animation) @values)
                            :frames   (mapv #(replace-all % @values) (:frames animation))}])
                     (reset! selected! nil))}]
       ]
      ]
     ]
    ))

(defn customize-canned
  []
  (r/with-let [selected (r/atom nil)]
    (let [canned (<<= [:conf/canned])
          animation (get canned (keyword @selected))]
      [:div {:style {:display "flex"}}
       [:div
        [:h3 "Customize Pre-built"]
        [mui/select-field
         {:floating-label-text "animation"
          :value               @selected
          :on-change           (fn [o k v]
                                 (js/console.log v)
                                 (reset! selected v))}
         (for [name (keys canned)]
           [mui/menu-item {:key          name
                           :value        name
                           :primary-text name}]
           )
         ]
        ]
       (when animation [customize-card selected animation])
       ])))
