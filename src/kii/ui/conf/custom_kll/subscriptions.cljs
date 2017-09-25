(ns kii.ui.conf.custom-kll.subscriptions
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [clojure.pprint]))

(defn get-custom-kll
  [db _]
  (let [conf (:conf db)
        layer (keyword (str (or (:active-layer conf) 0)))
        custom (-> conf :kll :custom )
        kll (or (layer custom) "")]
    kll))

(rf/reg-sub :conf/custom-kll get-custom-kll)
