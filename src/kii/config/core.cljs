(ns kii.config.core
  (:require [clojure.pprint]
            [kii.keys.firmware.map :as fw]
            [kii.keys.core :as keys]))

(defn de-key [m f]
  (into
    {}
    (map (fn [[k v]] [(name k) (if f (f k v) v)]) m)))

(defn mangle-layer
  [n layer]
  (do
    ;;(clojure.pprint/pprint n)
    ;;(clojure.pprint/pprint layer)
    (let [k (get fw/keys (:key layer))]
      {"key" (-> k :aliases first)
       "label" (:label k)})))

(defn mangle
  [config]
  {"header"  (de-key (:header config) nil)
   "defines" (mapv #(de-key (:data %) nil) (:defines config))
   "matrix"  (map (fn [key]
                    (do
                      ;;(clojure.pprint/pprint key)
                      (de-key
                        key
                        (fn [k v]
                          (if (= k :layers)
                            (let [layers (into {} (filter #(-> % second :key some?) v))]
                              ;;(clojure.pprint/pprint v)
                              ;;(clojure.pprint/pprint layers)
                              (de-key layers mangle-layer))
                            v)))))
                  (:matrix config))
   "custom"  (de-key (:custom config) nil)})

(defn normalize-layers
  [layers]
  (into
    {}
    (map (fn [[layer data]]
           (let [okey (:key data)
                 ;;olabel (:label data)
                 mapped (fw/alias->key okey)
                 iec (get (keys/key->iec) (:name mapped))]
             ;;(print okey "(" olabel ") =>" mapped)
             ;;(clojure.pprint/pprint iec)
             [layer
              (keys/merge mapped iec)
              #_{:key (:name mapped)
                 :label1 (or (:label1 iec) olabel)
                 :label2 (:label2 iec)
                 :label3 (:label3 iec)}]))
         layers)))

(defn normalize
  [config]
  (let [matrix (:matrix config)
        min-left (apply min (map :x matrix))
        min-top (apply min (map :y matrix))
        defines (or (:defines config) [])
        custom (or (:custom config) {})]
    (assoc config
      :matrix  (vec (map #(merge % {:x (- (:x %) min-left)
                                    :y (- (:y %) min-top)
                                    :layers (normalize-layers (:layers %))})
                         matrix))
      :defines (mapv #({:id (random-uuid) :data %})
                     defines)
      :custom  custom
      )))