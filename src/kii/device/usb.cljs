(ns kii.device.usb
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [kii.bindings.npm :as npm]
            [clojure.string :refer [join]]
            [cljs.core.async :refer [chan <! >! put! close!]]))

(defn get-devices-raw []
  (.getDeviceList npm/usb))

(defn safe-open-raw [device]
  (try
    (or (.open device) true)
    (catch :default e
      (js/console.log e)
      false)))

(defn safe-close-raw [device]
  (try
    (.close device)
    (catch :default e
      (js/console.log e)
      nil)))

(defn get-str-desc [device idx]
  (let [c (chan)]
    (if (> idx 0)
      (.getStringDescriptor device idx (fn [err val] (put! c val)))
      (put! c ""))
    c))

(defn -get-data
  "Gets basic data about an attached USB device"
  [device]
  (let [ch (chan)
        raw (:raw device)
        desc (.-deviceDescriptor raw)]
    (go
      (if-let [success? (safe-open-raw raw)]
        (let [ser (<! (get-str-desc raw (.-iSerialNumber desc)))
              prd (<! (get-str-desc raw (.-iProduct desc)))
              mfg (<! (get-str-desc raw (.-iManufacturer desc)))
              data (merge device
                          {:serial-no ser
                           :product prd
                           :manufacturer mfg
                           :openable? true})]
          (safe-close-raw raw)
          (>! ch data))
        (>! ch (assoc device :openable? false))))
    ch))

(defn -get-device-min
  [raw]
  (let [desc (.-deviceDescriptor raw)
        ports (.-portNumbers raw)]
    {:product-id (.-idProduct desc)
     :vendor-id (.-idVendor desc)
     :bus-no (.-busNumber raw)
     :path (str (.-busNumber raw) (when (seq ports) (str "-" (join "." ports))))
     :raw raw}))

(defn get-devices-min []
  (let [devices (get-devices-raw)]
    (map -get-device-min devices)))

(defn get-devices []
  (let [devices (get-devices-min)
        ch (chan)]
    (go
      (loop [devices devices]
        (when-let [device (first devices)]
          (let [c (-get-data device)
                d (<! c)]
            ;(print d)
            (>! ch d)
            (recur (rest devices))))
        )
      (close! ch))
    ch))

(defn usb-event-chan []
  (let [ch (chan)]
    (.on npm/usb "attach" #(go
                             (let [min (-get-device-min %)
                                   dev (<! (-get-data min))]
                               (put! ch [:attach dev]))))
    (.on npm/usb "detach" #(put! ch [:detach (-get-device-min %)]))
    ch))

;;==== Diagnostics ====;;
(defn pr-connected []
  (let [data-chan (get-devices)]
    (go-loop []
             (when-let [dev (<! data-chan)]
               (print (pr-str dev))
               ;(print (js->clj (pr-str (:raw dev))))
               (recur)))))
