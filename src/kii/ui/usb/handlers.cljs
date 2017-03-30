(ns kii.ui.usb.handlers
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [re-frame.core :as rf]
            [cljs.core.async :refer [<!]]
            [kii.device.usb :as usb]))

(defn watch-usb []
  (let [usb-chan (usb/usb-event-chan)]
    (go-loop []
             (let [[type device] (<! usb-chan)]
               (cond
                 (= :attach type) (rf/dispatch [:device/add device])
                 (= :detach type) (rf/dispatch [:device/remove device]))
               ))))

(rf/reg-fx
  :usb/watch
  (fn []
    (do
      (watch-usb)
      (rf/dispatch [:device/successful-watch]))))

(rf/reg-fx
  :usb/poll
  (fn []
    (let [data-chan (usb/get-devices)]
      (go-loop []
               (if-let [dev (<! data-chan)]
                 (do
                   (rf/dispatch [:device/add dev])
                   (recur))
                 (rf/dispatch [:device/successful-update]))))))
