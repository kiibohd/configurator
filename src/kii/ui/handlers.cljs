(ns kii.ui.handlers
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [re-frame.core :as rf]
            [kii.ui.db :as db]
            [kii.ui.alert.handlers]
            [kii.ui.device.handlers]
            [kii.ui.usb.handlers]
            [kii.ui.conf.handlers]
            [kii.ui.config :as config]
            [cljs.core.async :refer [chan <! >! put! close!]]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [kii.macros :refer-macros [<?]]
            [cljs.reader :refer [read-string]]
            [clojure.string :as str]
            [kii.device.keyboard :as keyboard]
            [kii.ui.util :as util]
            [cljs-time.instant]))

(defn initialize [_ _]
  db/default-db)

(rf/reg-event-db :initialize initialize)

(rf/reg-event-fx
  :boot
  (fn [_ _]
    {:db              db/default-db
     :usb/watch       nil
     :usb/poll        nil
     :indexed-db/load nil}))

;; Base Components

(defn set-active-panel [db [_ value]]
  (assoc db :active-panel value))

(rf/reg-event-db :panel/set-active set-active-panel)

(defn set-active-variant
  [db [_ variant]]
  (assoc db :active-variant variant))

(rf/reg-event-db :variant/set-active set-active-variant)

(rf/reg-event-db :layout/set-active
  (fn [db [_ layout]]
    (assoc db :active-layout layout)))

(defn safe-read-string
  ([raw start fallback-fn]
   (if (and raw (str/starts-with? raw start))
     (read-string raw)
     (if fallback-fn
       (fallback-fn raw)
       raw)))
  ([raw start] (safe-read-string raw start nil))
  )

(defn local-read-last-dl
  [raw]
  (safe-read-string raw "\"" #(when (some? %) {:bin %})))

(defn local-read-recent-dl
  [raw]
  (safe-read-string raw "{" (fn [_] {})))

(defn local-read-dfu-util-path
  [raw]
  (safe-read-string raw "\""))

(rf/reg-fx
  :indexed-db/load
  (fn []
    (go
      (let [dfu-util-path (<? (config/get :dfu-util-path))
            last-dl (<? (config/get :last-download))
            recent-dls (<? (config/get :recent-downloads))]
        ;(logf :debug "Setting [:dfu-util-path] - %s" dfu-util-path)
        ;(logf :debug "Setting [:last-download] - %s" last-dl)
        ;(logf :debug "Setting [:recent-downloads] - %s" recent-dls)
        (=>> [:db/raw-assoc-in [:local :dfu-util-path] (local-read-dfu-util-path dfu-util-path)])
        (=>> [:db/raw-assoc-in [:local :last-download] (local-read-last-dl last-dl)])
        (=>> [:db/raw-assoc-in [:local :recent-downloads] (local-read-recent-dl recent-dls)])
        ))))

(rf/reg-event-db
  :db/raw-assoc-in
  (fn [db [_ keys val]]
    (assoc-in db keys val)))

(rf/reg-event-fx
  :local/set-dfu-util-path
  (fn [cofx [_ value]]
    {:db             (assoc-in (:db cofx) [:local :dfu-util-path] value)
     :indexed-db/set [:dfu-util-path value]}))

(rf/reg-event-fx
  :local/set-last-download
  (fn [cofx [_ value]]
    {:db             (assoc-in (:db cofx) [:local :last-download] value)
     :indexed-db/set [:last-download value]}))

(rf/reg-event-fx
  :local/set-recent-downloads
  (fn [cofx [_ value]]
    {:db             (assoc-in (:db cofx) [:local :recent-downloads] value)
     :indexed-db/set [:recent-downloads value]}))

(rf/reg-event-fx
  :local/add-recent-downloads
  (fn [cofx [_ value variant]]
    (let [db (:db cofx)
          kbd (util/active-keyboard-name db)
          variant (or variant (:active-variant db))
          current (get-in db [:local :recent-downloads])
          updated (update-in current [kbd variant] #(conj % value))]
      {:db             (assoc-in db [:local :recent-downloads] updated)
       :indexed-db/set [:recent-downloads updated]})))

(rf/reg-fx
  :indexed-db/set
  (fn [[key value]]
    (config/set key (pr-str value))))