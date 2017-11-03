(ns kii.ui.usb.handlers
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [re-frame.core :as rf]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [cljs.core.async :refer [<!]]
            [kii.device.usb :as usb]))

(defn watch-usb []
  (let [usb-chan (usb/usb-event-chan)]
    (go-loop []
             (let [[type device] (<! usb-chan)]
               (logf :info "Action: %s\tDevice: %s" type device)
               (cond
                 (= :attach type) (rf/dispatch-sync [:device/add device])
                 (= :detach type) (rf/dispatch-sync [:device/remove device]))
               )
             (recur))))

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
                   (logf :info "Found device: %s" dev)
                   (rf/dispatch [:device/add dev])
                   (recur))
                 (rf/dispatch [:device/successful-update]))))))
