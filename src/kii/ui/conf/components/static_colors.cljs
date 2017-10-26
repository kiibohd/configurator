(ns kii.ui.conf.components.static-colors
  (:require [reagent.core :as r]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [cljs-react-material-ui.reagent :as mui]
            [kii.util :refer [str->int]]
            [kii.ui.conf.components.animation-selector :refer [animation-selector]]
            [kii.ui.color-picker :as color-picker]
            [cuerdas.core :as str]
            [clojure.string :as cstr])
  )

(def header "### AUTO GENERATED - DO NOT EDIT - STATIC COLOR MAP ###")
(def settings "replace:all")

(defn- parse-animation
  [{frames :frames}]
  (let [pix (seq (str/split (second frames) #",\n"))]
    (if (seq pix)
      (into {} (map #(let [[_ id r g b] (re-matches #"P\[(\d+)]\(\s*(\d+)s*,\s*(\d+)s*,\s*(\d+)s*\)" %1)]
                       [(str->int id) {:color {:r (str->int r)
                                               :g (str->int g)
                                               :b (str->int b)}}]
                       )
                    pix))
      {}))
  )

(defn- build-animation
  [led-status]
  {:frames
   [header (str/join ",\n"
                     (map #(str/fmt "P[$id]($r,$g,$b)"
                                    (merge {:id (first %)} (-> % second :color)))
                          led-status))]
   })

(defn- build-status
  [leds color]
  (into {}
        (for [[id l] leds]
          [id {:color color}])))

(defn color-editor
  [animation]
  (let [leds (<<= [:conf/selected-leds])
        statuses (<<= [:conf/led-all-statuses])
        color (or (reduce #(if (= %1 %2) %1 nil) (map #(:color (get statuses (first %1))) leds)) {})]
    [:div
     [color-picker/chrome
      {:disable-alpha true
       :color         (clj->js color)
       :on-change     #(let [c (js->clj %1 :keywordize-keys true)]
                         (=>> [:conf/set-led-status (build-status leds (:rgb c)) :append])
                         (=>> [:conf/partial-update-animation (build-animation statuses)])
                         )
       }]

     (when-not (seq leds)
       [:div
        [:br]
        [:span {:style {:color      "red"
                        :font-style "italic"}}
         "no leds are currently selected."]])
     ]

    )
  )

(defn static-colors
  []
  (r/with-let [prev-animation (r/atom nil)]
    (fn []
      (let [all-animations (<<= [:conf/animations])
            selected-animation (<<= [:conf/selected-animation])
            animations (select-keys all-animations (for [[k v] all-animations :when (-> v :frames first (= header))]
                                                     k))
            animation (and selected-animation (selected-animation animations))]
        [:div
         [:h3 "Static LED Maps"]
         [animation-selector animations selected-animation
          :validator #(and (contains? all-animations (keyword %)) (not (contains? animations (keyword %))) "Animation is not a static LED map.")
          :default-value {:settings settings :frames [header]}]
         (when (some? animation)
           ;; Only force reset the LED statuses when we change animations.
           (when (not= @prev-animation selected-animation)
             (reset! prev-animation selected-animation)
             (let [parsed (parse-animation animation)]
               (=>> [:conf/set-led-status parsed :overwrite])
               )
             )
           [:div {:key selected-animation}
            [:h5 "Assign Color"]
            [color-editor animation]
            ])
         ])))
  )

