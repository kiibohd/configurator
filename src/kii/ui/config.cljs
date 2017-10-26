(ns kii.ui.config
  (:refer-clojure :exclude [set get])
  (:require [cljsjs.localforage]
            [cljs.core.async :refer [chan <! >! put! close!]]
            [kii.macros :refer-macros [cb->chan]]))

(def local-forage js/localforage)

(.config local-forage
         #js {:name "kiibohd-configurator"
              :storeName "kiibohd-configurator"})

;; TODO - Sync between the re-frame db and IndexedDB
(defn set
  [key value]
  (cb->chan
    (.setItem local-forage (str key) value)))

(defn get
  [key]
  (cb->chan
    (.getItem local-forage (str key))))


