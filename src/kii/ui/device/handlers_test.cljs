(ns kii.ui.device.handlers-test
  (:require  [cljs.test :refer-macros [deftest is testing]]
             [kii.ui.device.handlers :as handlers]
             [kii.device.keyboard :as keyboard]))

(let [dev1 (merge (first keyboard/devices) {:path "1"})
      dev2 (merge (second keyboard/devices) {:path "2"})
      non-ic {:path "3"}]
  (deftest add-device
           (let [f #(handlers/add-device % [:device/add dev1])]
             (is (= (f {})                {:devices [dev1]}))
             (is (= (f {:devices [dev2]}) {:devices [dev2 dev1]}))
             (is (= (f {:devices [dev1]}) {:devices [dev1]})))
           (is (= (handlers/add-device {:devices []} [:device/add non-ic]) {:devices []})))
  (deftest remove-device
           (let [f #(handlers/remove-device % [:device/remove dev1])]
             (is (= (f {})                {:devices []}))
             (is (= (f {:devices [dev1]}) {:devices []}))
             (is (= (f {:devices [dev2]}) {:devices [dev2]})))))