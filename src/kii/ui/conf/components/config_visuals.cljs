(ns kii.ui.conf.components.config-visuals
  (:require [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.conf.components.assign-visuals :refer [assign-visuals]]))

(defstyle css
  [".errmsg"
   {:color      "red"
    :font-style "italic"}]
  )

(defn- get-trigger-data
  [{:keys [type action label] :as t}]
  (if (nil? t)
    nil
    ; Parse the action string which will look like A[<animation>](<action>)
    (let [[_ ani act] (re-matches #"A\[([A-Za-z0-9_]+)]\(([A-Za-z]+)\)" action)]
      (if ani
        {:action (keyword act)
         :animation ani}
        nil))))

(defn config-visuals []
  (let [active-layer (rf/subscribe [:conf/active-layer])
        selected-key (rf/subscribe [:conf/selected-key])
        triggers (->> @selected-key :triggers ((keyword (str @active-layer)))
                      (filterv #(= "animation" (:type %))))
        keygen #(str (:board @selected-key) "-" (:code @selected-key) "-" @active-layer "-" % "/" (count triggers))
        ]
    [:div
     [:h3 "Visuals"]
     [:h4 {:style {:margin-bottom (if (some? @selected-key) "0" "1.33em")}}
      "Assigned Animation Controls"]
     (if (some? @selected-key)
       (doall
         (map-indexed
           (fn [idx trigger]
             (let [td (get-trigger-data trigger)
                   remove-trigger (fn [_] (rf/dispatch [:conf/remove-trigger trigger]))
                   add-trigger (fn [{:keys [action animation]}]
                                 (rf/dispatch [:conf/add-trigger
                                               {:type   "animation"
                                                :label  (str (name action) " '" animation "' animation")
                                                :action (str "A[" animation "](" (name action) ")")}])) ]
               ^{:key (keygen idx)}
               [assign-visuals td (if (nil? td) add-trigger remove-trigger)]
               ))
           (conj triggers nil)))

       [:span {:class (:errmsg css)} "no key is currently selected."]
       )
     ]))
