(ns kii.ui.conf.custom-kll.handlers
  (:require [reagent.core :as r]
            [re-frame.core :as rf] ))

(defn set-custom-kll
  [db [_ value layer]]
  (let [layer (keyword (str (or layer (-> db :conf :active-layer) 0)))]
    (assoc-in db [:conf :kll :custom layer] value)))

(rf/reg-event-db :conf/custom-kll set-custom-kll)

