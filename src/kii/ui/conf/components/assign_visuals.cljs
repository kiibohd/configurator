(ns kii.ui.conf.components.assign-visuals
  (:require [kii.util]
            [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-react-material-ui.reagent :as mui]
            [cljs-react-material-ui.icons :as mui-icons]
            [clojure.string :as cstr]))

(defn- existing? [name animations]
  (contains? animations (keyword name)))

(defn assign-visuals [trigger on-click]
  (let [animations (rf/subscribe [:conf/animations])]
    (r/with-let [action (r/atom (:action trigger))
                 animation (r/atom (:animation trigger))
                 names (r/atom (or (keys @animations) []))]
      (fn [trigger on-click]
        [:div {:style {:display "flex"}}
         [mui/auto-complete
          {:search-text         @animation
           :floating-label-text "name"
           :dataSource          @names
           :disabled            (some? trigger)
           :open-on-focus       true
           :error-text          (when (and (some? @animation) (> (count @animation) 0)
                                           (not (existing? @animation @animations)))
                                  "Animation does not exist.")
           :on-update-input     (fn [s ds p] (reset! animation s))
           :filter              (fn [s k] (some? (cstr/index-of k s)))
           }]
         [mui/select-field
          {:disabled            (some? trigger)
           :floating-label-text "action"
           :value               @action
           :on-change           (fn [o k v] (reset! action v))
           }
          [mui/menu-item {:value :start :primary-text "start"}]
          [mui/menu-item {:value :pause :primary-text "pause"}]
          [mui/menu-item {:value :stop :primary-text "stop"}]
          ]
         [mui/icon-button
          {:style    {:margin-left "1em" :align-self "flex-end"}
           :on-click #(on-click {:action @action :animation @animation})
           :disabled (and (nil? trigger) (or (nil? @animation) (nil? @action)))}
          (if (some? trigger)
            [mui-icons/content-remove-circle-outline]
            [mui-icons/content-add-circle-outline
             {:color (if (and (nil? trigger) (or (nil? @animation) (nil? @action)))
                       "gray" "black")}])
          ]
         ]))
    ))