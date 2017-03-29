(ns kii.ui.util
  (:require [re-frame.core :as rf]))

(defn dispatch-all
  [& msgs]
  (doseq [msg msgs]
    (rf/dispatch msg)))

(defn ->c
  [& args]
  (clojure.string/join
    " "
    (map (fnil str "") args)))

(defn ->c+s
  [styles & names]
  (clojure.string/join
    " "
    (map #(if (nil? %)
            ""
            (% styles))
         names)))