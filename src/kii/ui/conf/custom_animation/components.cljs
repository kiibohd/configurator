(ns kii.ui.conf.custom-animation.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-react-material-ui.reagent :as mui]
            [kii.ui.styling :as styling]
            [clojure.pprint]
            [clojure.string :as cstr]))

(def max-width "calc(100% - 2em)")

(defn animation-editor [animation]
  (r/with-let [a (r/atom (cstr/join "\n" (:frames animation)))]
    [mui/text-field
     {:default-value        @a
      :floating-label-fixed true
      :floating-label-text  "frames — each frame separated by a semi-colon \";\""
      :multi-line           true
      :on-blur              #(rf/dispatch-sync [:conf/partial-update-animation {:frames (cstr/split @a #";")}])
      :on-change            (fn [_ val] (reset! a val))
      :rows                 5
      :style                {:display     "block"
                             :width       max-width
                             :font-family styling/monospace-font-stack}
      :textarea-style       {:white-space    "pre"
                             :padding-bottom "1.2em"
                             :overflow-y     "hidden"
                             :font-size      "0.9em"}
      }]
    ))

(defn animation-settings
  [animation]
  (r/with-let [a (r/atom (:settings animation))]
    [mui/text-field
     {:floating-label-text "settings"
      :default-value       @a
      :disabled            (nil? animation)
      :on-change           (fn [_ val] (do) (reset! a val))
      :on-blur             #(rf/dispatch-sync [:conf/partial-update-animation {:settings @a}])
      :style               {:display "block"
                            :width max-width}
      }]
    ))


(defn animation-selector
  [animations selected-animation]
  (letfn [(valid-name? [x]
            (some? (re-find #"^[A-Za-z_][A-Za-z0-9_]*$" (name x))))
          (existing? [name animations]
            (contains? animations (keyword name)))
          (create-new? [name animations]
            (and (some? name)
                 (valid-name? name)
                 (not (existing? name animations))))
          (name-error [value animations]
            (cond
              (nil? value) nil
              (= 0 (count (name value))) nil
              (create-new? value animations) "press enter to create new animation"
              (not (valid-name? value)) "invalid name - valid characters [A-Za-z0-9_] must not start with number"))]
    (r/with-let [a (r/atom (or selected-animation nil))
                 names (r/atom (keys animations))]
      [mui/auto-complete
       {:search-text         @a
        :style               {:display "block"}
        :floating-label-text "name"
        :dataSource          @names
        :open-on-focus       true
        :error-text          (name-error @a animations)
        :on-blur             #(when (and (some? selected-animation) (not= @a (name selected-animation)))
                                (rf/dispatch-sync [:conf/set-selected-animation (keyword @a)]))
        :on-new-request      (fn [val idx]
                               (let [name (keyword val)
                                     selected (if (>= idx 0)
                                                (nth @names idx)
                                                (when (contains? animations name) name))]
                                 (if (some? selected)
                                   (rf/dispatch-sync [:conf/set-selected-animation selected])
                                   (do
                                     (reset! names (conj @names name))
                                     (rf/dispatch-sync [:conf/add-animation name {:settings "" :frames []}])))))
        :on-update-input     (fn [s ds p] (do (reset! a s)))
        :filter              (fn [s k] (some? (cstr/index-of k s)))
        }]
      )))

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
