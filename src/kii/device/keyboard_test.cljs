(ns kii.device.keyboard-test
  (:require [cljs.test :refer-macros [deftest is testing]]
            [kii.device.keyboard :as kbd]))

(deftest product->keyboard
  (let [unknown? #(= "Unknown" (:display %))]
    (testing "actual keyboard"
      (is (some? (kbd/product->keyboard "Infinity_60%")))
      (is (unknown? (kbd/product->keyboard "WallaWalla")))
      )
    (testing "loooong name"
      (is (some? (kbd/product->keyboard "Keyboard - WhiteFox Partial map")))
      (is (unknown? (kbd/product->keyboard "This is a crazy keyboard"))))))

(deftest get-ic-device
  (testing "boards"
    (is (some? (kbd/get-ic-device {:vendor-id 0x1c11 :product-id 0xb04d})))
    (is (nil? (kbd/get-ic-device {:vendor-id 0xdead :product-id 0xb33f})))))

(deftest ic?
  (testing "boards"
    (is (true? (kbd/ic? {:vendor-id 0x1c11 :product-id 0xb04d})))
    (is (false? (kbd/ic? {:vendor-id 0xdead :product-id 0xb33f})))))

(deftest flashable?
  (testing "boards"
    (is (false? (kbd/flashable? {:vendor-id 0x1c11 :product-id 0xb04d})))
    (is (true? (kbd/flashable? {:vendor-id 0x1c11 :product-id 0xb007})))
    (is (false? (kbd/flashable? {:vendor-id 0xdead :product-id 0xb33f})))))
