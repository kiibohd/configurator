(ns kii.ui.conf.components.animation-selector
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-react-material-ui.reagent :as mui]
            [clojure.string :as cstr]
            [kii.config.core :as config]))

(defn animation-selector
  [animations selected-animation & {:keys [validator default-value]
                                    :or {validator (constantly nil)
                                         default-value {:settings "" :frames []}}}]
  (letfn [(existing? [name animations]
            (contains? animations (keyword name)))
          (create-new? [name animations]
            (and (some? name)
                 (config/valid-animation-name? name)
                 (not (existing? name animations))))
          (name-error [value animations]
            (cond
              (nil? value) nil
              (= 0 (count (name value))) nil
              (validator value) (validator value)
              (create-new? value animations) "press enter to create new animation"
              (not (config/valid-animation-name? value)) "invalid name - valid characters [A-Za-z0-9_] must not start with number"))]
    (r/with-let [a (r/atom (or selected-animation nil))
                 names (r/atom (or (keys animations) []))]
      (fn [animations selected-animation & {:keys [validator default-value]
                                    :or {validator (constantly nil)
                                         default-value {:settings "" :frames []}}}]
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
                                 (when (and (config/valid-animation-name? val) (not (validator val)))
                                   (let [name (keyword val)
                                         selected (if (>= idx 0)
                                                    (nth @names idx)
                                                    (when (contains? animations name) name))]
                                     (if (some? selected)
                                       (rf/dispatch-sync [:conf/set-selected-animation selected])
                                       (do
                                         (reset! names (conj @names name))
                                         (rf/dispatch-sync [:conf/add-animation name default-value]))))))
          :on-update-input     (fn [s ds p] (reset! a s))
          :filter              (fn [s k] (some? (cstr/index-of k s)))
          }])
      )))
