(ns kii.ui.conf.custom-kll.handlers
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [clojure.pprint]))

(defn set-custom-kll
  [db [_ value]]
  (let [layer (keyword (str (or (-> db :conf :active-layer) 0)))]
    (assoc-in db [:conf :kll :custom layer] value)))

(rf/reg-event-db :conf/custom-kll set-custom-kll)

