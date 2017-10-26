(ns kii.ui.handlers-test
  (:require  [cljs.test :refer-macros [deftest is testing]]
             [kii.ui.handlers :as handlers]))

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
