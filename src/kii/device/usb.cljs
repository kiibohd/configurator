(ns kii.device.usb
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [kii.bindings.npm :as npm]
            [cuerdas.core :as str]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [cljs.core.async :refer [chan <! >! put! close!]]
            [kii.device.keyboard :as kbd]))

(defn get-devices-raw []
  (.getDeviceList npm/usb))

(defn- device-path [device]
  (let [ports (.-portNumbers device)
        bus (.-busNumber device)]
    (if (seq ports)
      (str/fmt "%s-%s" bus (str/join "." ports))
      (cljs.core/str bus))))

(defn safe-open-raw [device]
  (try
    (or (.open device false) true)
    (catch :default e
      (logf :warn e "Cannot open usb device - %s" (device-path device))
      false)))

(defn safe-close-raw [device]
  (try
    (.close device)
    (catch :default e
      (logf :warn e "Cannot close usb device - %s" (device-path device))
      nil)))

(defn get-str-desc [device idx]
  (let [c (chan)]
    (if (> idx 0)
      (.getStringDescriptor device idx (fn [err val] (put! c (or val ""))))
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
     :vendor-id  (.-idVendor desc)
     :bus-no     (.-busNumber raw)
     :path       (device-path raw)
     :raw        raw
     :connected  true}))

(defn get-devices-min []
  (let [devices (get-devices-raw)]
    (map -get-device-min devices)))

(defn get-devices []
  (let [devices (get-devices-min)
        ch (chan)]
    (go
     (loop [devices devices]
       (when-let [device (first devices)]
         (do
           (if (some? (kbd/get-ic-device device))
             (let [c (-get-data device)
                   d (<! c)]
               (>! ch d))
             (logf :info "Skipping: %s" device))
           (recur (rest devices)))
         )
       )
     (close! ch))
    ch))

(defn- attach-device
  [ch raw-device]
  (logf :debug "attach device call %s" raw-device)
  (let [min (-get-device-min raw-device)]
   (if (some? (kbd/get-ic-device min))
     (go
      (logf :debug "opening device")
      (let [dev (<! (-get-data min))]
        (logf :debug "got device - %s" dev)
        (put! ch [:attach dev])))
     (logf :debug "Skipping: %s" min))
   )
  )

(defn usb-event-chan []
  (let [ch (chan)]
    (.on npm/usb "attach" #(attach-device ch %))
    (.on npm/usb "detach" #(put! ch [:detach (-get-device-min %)]))
    ch))
