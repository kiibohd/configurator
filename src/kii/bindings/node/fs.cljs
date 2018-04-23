(ns kii.bindings.node.fs
  (:require [cljs.core.async :refer [chan <! >! put! close!]]
            [kii.bindings.cljsjs :refer [jszip]]
            [kii.macros :refer-macros [<? go-try p->chan cb->chan]])
  )

(def -fs (js/require "fs"))
(def -mkdirp (js/require "mkdirp"))

(defn chmod
  [path mode]
  (cb->chan (.chmod -fs path mode)))

(defn chmod!
  [path mode]
  (try
    (.chmodSync -fs path mode)
    (catch js/Error e
      (throw e))))

(defn copy-file
  ([src dst] (cb->chan (.copyFile -fs src dst)))
  ([src dst flags] (cb->chan (.copyFile -fs src dst flags))))

(defn read-file
  ([path] (cb->chan (.readFile -fs path)))
  ([path opts] (cb->chan (.readFile -fs path (clj->js opts)))))

(defn read-file!
  ([path] (.readFileSync -fs path))
  ([path opts] (.readFileSync -fs path (clj->js opts))))

(defn write-file
  ([path contents] (cb->chan (.writeFile -fs path contents)))
  ([path contents opts] (cb->chan (.writeFile -fs path contents (clj->js opts)))))

(defn write-file!
  ([path contents] (.writeFileSync -fs path contents))
  ([path contents opts] (.writeFileSync -fs path contents (clj->js opts))))

(defn directory-exists
  [path]
  (cb->chan (.stat -fs path) #(.isDirectory %) #(if (= (.-code %) "ENOENT") false %)))

(defn directory-exists!
  [path]
  (try
    (.statSync -fs path)
    (catch js/Error e
      (if (= (.-code e) "ENOENT")
        false
        (throw e)))))

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


