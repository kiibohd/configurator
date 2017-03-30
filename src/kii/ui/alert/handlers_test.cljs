(ns kii.ui.alert.handlers-test
  (:require  [cljs.test :refer-macros [deftest is testing]]
             [kii.ui.alert.handlers :as handlers]))

(let [err {:type :error :msg "HELLLP"}
      wrn {:type :warning :msg "Waaat"}
      suc {:type :success :msg "YAY"}]
  (deftest add-alert
    (let [f #(handlers/add-alert % [:alert/add %2])]
      (is (= (f {}              err) {:alerts [err]}))
      (is (= (f {:alerts [err]} err) {:alerts [err]}))
      (is (= (f {:alerts [err]} wrn) {:alerts [err wrn]}))))
  (deftest remove-alert
    (let [f #(handlers/remove-alert % [:alert/remove %2])]
      (is (= (f {}              err) {:alerts []}))
      (is (= (f {:alerts [err]} err) {:alerts []}))
      (is (= (f {:alerts [err]} wrn) {:alerts [err]}))
      )))
