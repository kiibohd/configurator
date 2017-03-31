(ns kii.keys.core
  (:refer-clojure :exclude [merge]))

(defn merge
  "Merge a firmware defined key with the locale specific key."
  [firmware locale]
  {:key (:name firmware)
   :label1 (or (:label1 locale) (:label firmware))
   :label2 (:label2 locale)
   :label3 (:label3 locale)})