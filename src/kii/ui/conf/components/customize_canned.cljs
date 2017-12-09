(ns kii.ui.conf.components.customize-canned
  (:require [reagent.core :as r]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [cljs-react-material-ui.reagent :as mui]
            [cuerdas.core :as str]
            [kii.ui.color-picker :as color-picker]
            [kii.util :as util]
            [kii.bindings.cljsjs :refer [chroma]]
            [kii.config.core :as config]))

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
                    darken-pct (and darken-pct (util/str->float darken-pct))]
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

(defn name-error [value existing]
  (cond
    (nil? value) nil
    (= 0 (count (name value))) nil
    (not (config/valid-animation-name? value)) "invalid name - valid characters [A-Za-z0-9_] must not start with number"
    (some #(= value %) existing) "an animation with that name already exists"))

(defn- customize-card
  [selected! {:keys [configurable description frames settings] :as animation}]
  (r/with-let [name (r/atom (if (keyword? @selected!) (name @selected!) @selected!))
               values (r/atom (into {} (map (fn [x] [(:name x) (:default x)]) configurable)))]
    (fn [selected! {:keys [configurable description frames settings] :as animation}]
      (let [animations (<<= [:conf/animations])
            existing-names (map cljs.core/name (keys animations))
            ;; TODO - Better solution here.
            get-name #(if (keyword? @name) (cljs.core/name @name) @name)]
        [:div
         [mui/card
          {:style {:min-width   "35em"
                   :margin-left "2em"
                   :margin-top  "1em"}}
          [mui/card-text
           [mui/text-field {:floating-label-text "name to create as"
                            :default-value       (get-name)
                            :on-change           (fn [_ val] (reset! name val))
                            :error-text          (name-error @name existing-names)
                            }]]
          [mui/card-text
           description
           ]
          [:hr {:style {:margin "0 10px"}}]
          [mui/card-header {:text-style {:padding-right "0"}
                            :style      {:padding-bottom "0"}}
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
             :disabled (or (not (config/valid-animation-name? (get-name)))
                           (some #(= (get-name) %) existing-names))
             :on-click (fn []
                         ;; Add the animation & perform replacements
                         (=>> [:conf/add-animation (keyword @name)
                               {:settings (replace-all settings @values configurable)
                                :type     (:type animation)
                                :frames   (mapv #(replace-all % @values configurable) frames)}])
                         ;; Append the required custom-kll
                         (when-not (str/empty-or-nil? (:custom-kll animation))
                           (let [custom-kll (<<= [:conf/custom-kll 0])
                                 additions (str/replace (str "### Added by canned animation ${__NAME__} ###\n" (:custom-kll animation))
                                                        "${__NAME__}" (get-name))]
                             (=>> [:conf/custom-kll (str/fmt "%s\n\n%s\n" custom-kll additions)])))
                         ;; Reset to nothing selected.
                         (reset! selected! nil))}]
           ]
          ]
         ]))
    ))

(defn customize-canned
  []
  (r/with-let [selected (r/atom nil)]
    (let [canned (<<= [:conf/canned])
          locals (<<= [:local/canned-animations])
          all (merge canned locals)]
      (fn []
        [:div {:style {:display "flex"}}
         [:div
          [:h3 "Customize Pre-built"]
          [mui/select-field
           {:floating-label-text "animation"
            :value               @selected}
           (for [k (keys canned)]
             ^{:key k}
             [mui/menu-item {:value        k
                             ;; Using on click here due to value being coerced into a string
                             ;; for the select-field's on-change event.
                             :on-click #(reset! selected k)
                             :primary-text (name k)}])
           (when (not-empty locals)
             [mui/divider])
           (for [k (keys locals)]
             ^{:key k}
             [mui/menu-item {:value        k
                             ;; Using on click here due to value being coerced into a string
                             ;; for the select-field's on-change event.
                             :on-click     #(reset! selected k)
                             :primary-text (name k)}])
           ]
          ]
         (when-let [animation (get all @selected)]
           ;; Key is specified to force a reload of reagent atoms when we change selections.
           ^{:key @selected}
           [customize-card selected animation])
         ]))))
