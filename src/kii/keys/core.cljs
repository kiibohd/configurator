(ns kii.keys.core
  (:refer-clojure :exclude [merge keys])
  (:require [kii.keys.en-us.map]))

(defn merge
  "Merge a firmware defined key with the locale specific key."
  [firmware locale]
  ; We treat :clear specially, TODO: Make this a little less special.
  (if (= (:name firmware) :clear)
    nil
    {:key (:name firmware)
     :label1 (or (:label1 locale) (:label firmware))
     :label2 (:label2 locale)
     :label3 (:label3 locale)
     :style (:style firmware)}
    ))


(defn ->iec-map
  [code key l1 l2 l3]
  {:iec code
   :key key
   :label1 l1
   :label2 l2
   :label3 l3})

;; TODO: Make this take the locale, don't hardcode en-us
(def locale kii.keys.en-us.map/locale)

(defn keys
  ([] (keys locale))
  ([locale] (:keys locale)))

(defn iec->key
  ([] (iec->key locale))
  ([locale] (:iec->key locale)))

(defn key->iec
  ([] (key->iec locale))
  ([locale] (:key->iec locale)))


(defn code->iec
  ([] (code->iec locale))
  ([locale] (:code->iec locale)))