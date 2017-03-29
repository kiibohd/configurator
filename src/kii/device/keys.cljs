(ns kii.device.keys
  (:require [kii.device.keys-config :as keys-config]))

(defn ->category
  [name label]
  {:name name
   :label label})

(def categories
  (map
    #(apply ->category %)
    [[:spec "special"]
     [:std "standard"]
     [:core "core"]
     [:mmed "multimedia"]
     [:num "numpad"]
     [:i11l "international"]
     [:mac "macros"]
     ]))

(defn ->key
  [order name label aliases group]
  {:name name
   :aliases (or aliases [label])
   :label label
   :group group
   :order order})

(defonce predefined
         (into
           {}
           (map-indexed
             #(vector (first %2) (apply ->key % %2))
             keys-config/defaults
             )))

(defn alias->key
  [alias]
  (some (fn [[name k]]
          (let [aliases (:aliases k)]
            (and (some #{alias} aliases)
                 k)))
        predefined))
