(ns kii.ui.conf.components.customize-canned
  (:require [reagent.core :as r]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [cljs-react-material-ui.reagent :as mui]
            [cuerdas.core :as str]
            [kii.ui.color-picker :as color-picker]
            [kii.util :as util]
            [kii.bindings.cljsjs :refer [chroma]]))

;;TODO - Don't allow overwrite of same animation.
;;TODO? - Allow custom kll to be put on a different layer.
;;TODO! - Fix the canned animation syntax the ':' for interpolation and '!' for darken is limiting

(defn- replace-all
  [string values config]
  (letfn [(rgb->js [m] #js [(:r m) (:g m) (:b m)])
          (chroma->vec [c] (-> c (.rgb) js->clj))
          (interp [c1 c2 pct] (if (and (some? c2) (some? pct))
                                (.mix chroma c1 c2 pct "lab")
                                c1))
          (construct-color [value interp-to interp-pct darken-pct]
            (if (or (some? interp-to) (some? darken-pct))
              (let [interp-to (if (or (nil? interp-to) (str/starts-with? interp-to "#"))
                                interp-to                   ;; nil -or- hex-code color
                                (rgb->js (get values interp-to)))
                    interp-pct (and interp-pct (util/str->float interp-pct))
                    darken-pct  (and darken-pct (util/str->float darken-pct))]
                (str/fmt "$0,$1,$2" (-> (rgb->js value)
                                        (interp interp-to interp-pct)
                                        (interp "#000000" darken-pct)
                                        chroma->vec)))
              (str/fmt "$r,$g,$b" value))
            )
          (def-rep [s name value] (str/replace s (str "${" name "}") value))
          (clr-rep [s name value]
            (str/replace s (re-pattern (str "\\$\\{" name ":?([\\w.#]+)?:?([\\d.]+)?\\!?([\\d.]+)?}"))
                         (fn [[_ interp-to interp-pct darken-pct]]
                            (construct-color value interp-to interp-pct darken-pct))))]
    (loop [[{:keys [name type] :as c} & cs] (seq config)
           s string]
      (if (some? c)
        (let [value (get values name)]
          (recur cs (case type
                      "color" (clr-rep s name value)
                      (def-rep s name value))))
        s)
      ))
  )

(defn- customization
  [vals! {:keys [name type default values] :as entry}]
  (case type
    "select" [mui/select-field
              {:floating-label-text name
               :value               (get @vals! name)
               :on-change           (fn [o k v]
                                      (swap! vals! assoc name v))
               }
              (for [{:keys [name value]} values]
                [mui/menu-item {:key          name
                                :value        value
                                :primary-text name}])]
    "color" [:span
             [:h4 (str/human name)]
             [color-picker/chrome
              {:disable-alpha true
               :color         (clj->js (get @vals! name))
               :on-change     #(let [c (js->clj %1 :keywordize-keys true)]
                                 (swap! vals! assoc name (:rgb c)))
               }]]

    :else [:h5 "Unknown customization..."]
    )
  )

(defn- customize-card
  [selected! {:keys [configurable description frames settings] :as animation}]
  (r/with-let [name (r/atom @selected!)
               values (r/atom (into {} (map (fn [x] [(:name x) (:default x)]) configurable)))]
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
       description
       ]
      [:hr {:style {:margin "0 10px"}}]
      [mui/card-header {:text-style {:padding-right "0" }
                        :style {:padding-bottom "0"}}
       "customizations"]
      (if (count configurable)
        [mui/card-text
         {:style {}}
         (for [c configurable]
           ^{:key (:name c)}
           [customization values c])]
        [mui/card-text {:style {:font-style "italic" :padding-top "0"}}
         "none"])
      [mui/card-actions
       [mui/raised-button
        {:label    "Add Animation"
         :primary  true
         :on-click (fn []
                     ;; Add the animation & perform replacements
                     (=>> [:conf/add-animation (keyword @name)
                           {:settings (replace-all settings @values configurable)
                            :frames   (mapv #(replace-all % @values configurable) frames)}])
                     ;; Append the required custom-kll
                     (when-not (str/empty-or-nil? (:custom-kll animation))
                       (let [custom-kll (<<= [:conf/custom-kll 0])
                             additions (str/replace (str "### Added by canned animation ${__NAME__} ###\n" (:custom-kll animation))
                                                    "${__NAME__}" @name)]
                         (=>> [:conf/custom-kll (str/fmt "%s\n\n%s\n" custom-kll additions)])))
                     ;; Reset to nothing selected.
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
                                 (reset! selected v))}
         (for [name (keys canned)]
           [mui/menu-item {:key          name
                           :value        name
                           :primary-text name}]
           )
         ]
        ]
       (when animation
         ;; Key is specified to force a reload of reagent atoms when we change selections.
         ^{:key @selected}
         [customize-card selected animation])
       ])))
