(ns kii.device.keyboard
  (:require [clojure.string :as s]))

(def devices
  [{:vendor-id 0x1c11 :product-id 0xb04d :flashable? false} ;Board
   {:vendor-id 0x1c11 :product-id 0xb007 :flashable? true}  ;Boot
   {:vendor-id 0x1209 :product-id 0x01c0 :flashable? false} ;Registered Board
   {:vendor-id 0x1209 :product-id 0x01cb :flashable? true}]) ;Registered Boot

(def keyboards
  [{:display "Infinity Ergodox"
    :names ["MDErgo1" "Infinity_Ergodox"]
    :layouts ["Default"]}
   {:display "Infinity 60% LED"
    :names ["MD1.1" "Infinity_60%_LED"]
    :layouts ["Standard" "Hacker" "Alphabet"]}
   {:display "Infinity 60%"
    :names ["MD1" "Infinity_60%"]
    :layouts ["Standard" "Hacker"]}
   {:display "WhiteFox"
    :names ["WhiteFox"]
    :layouts ["The True Fox" "Aria" "Iso" "Vanilla" "Jack of All Trades" "Winkeyless"]}
   {:display "K-Type"
    :names ["KType"]
    :layouts ["Standard"]}])

(defn get-ic-device
  [device]
  (let [vid (:vendor-id device)
        pid (:product-id device)]
    (first (filter #(and (= (:vendor-id %) vid)
                         (= (:product-id %) pid))
                   devices))))

(defn ic?
  [device]
  (some? (get-ic-device device)))

(defn product->keyboard
  [product]
  (first (filter (fn [k] (some #(s/includes? product %) (:names k))) keyboards)))

(defn flashable?
  [device]
  (if-let [icd (get-ic-device device)]
    (true? (:flashable? icd))
    false))
