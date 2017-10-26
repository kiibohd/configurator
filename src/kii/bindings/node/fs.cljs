(ns kii.bindings.node.fs
  (:require [cljs.core.async :refer [chan <! >! put! close!]]
            [kii.bindings.cljsjs :refer [jszip]]
            [kii.macros :refer-macros [<? go-try p->chan cb->chan]])
  )

(def -fs (js/require "fs"))
(def -mkdirp (js/require "mkdirp"))

(defn read-file
  ([path] (cb->chan (.readFile -fs path)))
  ([path opts] (cb->chan (.readFile -fs path (clj->js opts)))))

(defn read-file!
  ([path] (.readFileSync -fs path))
  ([path opts] (.readFileSync -fs path (clj->js opts))))

(defn write-file
  ([path contents] (cb->chan (.writeFile -fs path contents)))
  ([path contents opts] (cb->chan (.writeFile -fs path (clj->js opts)))))

(defn write-file!
  ([path contents] (.writeFileSync -fs path contents))
  ([path contents opts] (.writeFileSync -fs path (clj->js opts))))

;; TODO - CLJSJS mkdirp
(defn mkdirp
  [path]
  (cb->chan (-mkdirp path)))

(defn make-dir!
  ([path]
   (try
     (.mkdirSync -fs path)
     (catch js/Error e
       ))))


