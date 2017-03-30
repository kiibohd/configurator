(ns kii.ui.base.handlers-test
  (:require  [cljs.test :refer-macros [deftest is testing]]
             [kii.ui.base.handlers :as handlers]))

(deftest set-active-panel
  (testing "single entry"
    (let [db {:active-panel :main-panel}]
      (is (= (handlers/set-active-panel db [:panel/set-active :some-panel])
             {:active-panel :some-panel}))
      (is (= (handlers/set-active-panel db [:panel/set-active nil])
             {:active-panel nil}))))
  (testing "multiple entries"
    (let [db {:foo :bar}]
      (is (= (handlers/set-active-panel db [:panel/set-active :some-panel])
             {:foo :bar :active-panel :some-panel})))))


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
