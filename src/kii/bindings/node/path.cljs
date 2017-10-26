(ns kii.bindings.node.path
  (:require [kii.util :as util]))

(def -path (js/require "path"))

(defn parse
  [path]
  (util/jsx->clj (.parse -path path)))

(defn join
  [& paths]
  (apply (.-join -path) (clj->js paths)))
