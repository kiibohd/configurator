(ns kii.ui.re-frame
  ^{:doc "Aliases for re-frame actions that take advantage of font ligatures"}
  (:require [re-frame.core :as rf]))

(defn =A=>
  [& msgs]
  (doseq [msg msgs]
    (rf/dispatch msg)))

(def <== rf/subscribe)

(def <<= (comp deref rf/subscribe))

(def =>> rf/dispatch)

(def >=> rf/dispatch-sync)
