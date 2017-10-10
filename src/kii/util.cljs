(ns kii.util
  (:require [camel-snake-kebab.core :as csk]
            [goog.string :as gstring]))

(defn all-properties
  [object]
  (loop [object object
         all-props []]
    (let [props (concat all-props (map str (.keys js/Object object)))]
      (if-let [proto (.getPrototypeOf js/Object object)]
        (recur proto props)
        props))))

(defn jsx->clj
  "Convert a JavaScript object to a clojure map with kebob-cased keywords."
  [object & {:keys [members] :or {members []}}]
  (let [own-props (.keys js/Object object)
        all-props (all-properties object)]
    (into
      {}
      (for [k all-props]
        (let [prop k
              keywd (csk/->kebab-case-keyword (str prop))
              val (aget object prop)]
          #_(print "Prop: " prop " Keyword: " keywd)
          [keywd
           (if (some #{keywd} members)
             (jsx->clj val)
             val)])))))

(defn unescape
  [s]
  (if s
    (gstring/unescapeEntities s)
    s))

