(ns kii.ui.conf.custom-kll.subscriptions
  (:require [reagent.core :as r]
            [re-frame.core :as rf]))

(defn get-custom-kll
  [db [_ layer]]
  (let [conf (:conf db)
        layer (keyword (str (or layer (:active-layer conf) 0)))
        custom (-> conf :kll :custom )
        kll (or (layer custom) "")]
    kll))

(rf/reg-sub :conf/custom-kll get-custom-kll)
