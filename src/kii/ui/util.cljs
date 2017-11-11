(ns kii.ui.util
  (:require [re-frame.core :as rf]
            [kii.device.keyboard :as keyboard]))

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

(defn active-keyboard-name
  [db]
  (-> db :active-keyboard :product keyboard/product->keyboard :names first))