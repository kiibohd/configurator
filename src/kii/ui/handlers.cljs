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
            [kii.device.keyboard :as keyboard]
            [kii.ui.util :as util]
            [cljs-time.instant]
            [kii.util :refer [str->int]]
            [cljs-time.coerce :as time-coerce]
            [cljs-time.core :as time]
            [ajax.core :as ajax]
            [version-clj.core :as ver]
            [kii.bindings.electron-renderer :as electron]
            [cuerdas.core :as str]
            [kii.store :as store]
            [kii.env :as env]
            [kii.util :as u]))

(defn initialize [_ _]
  db/default-db)

(rf/reg-event-db :initialize initialize)

(rf/reg-event-fx
 :boot
 (fn [_ _]
   {:db              db/default-db
    :usb/watch       nil
    :usb/poll        nil
    :indexed-db/load nil
    :version-check   nil
    :dfu-util-check  nil
    :zadic-check nil}))

;; Base Components

(defn set-active-panel [db [_ value]]
  (let [current (:active-panel db)]
    (if (not= db current)
      (merge db {:prev-panel   current
                 :active-panel value})
      db)))

(rf/reg-event-db :panel/set-active set-active-panel)

(defn set-active-variant
  [db [_ variant]]
  (assoc db :active-variant variant))

(rf/reg-event-db :variant/set-active set-active-variant)

(rf/reg-event-db :layout/set-active
                 (fn [db [_ layout]]
                   (assoc db :active-layout layout)))

(rf/reg-fx
 :version-check
 (fn []
   (go
    (let [last-check (<? (config/get :last-version-check))
          last-check (-> (or last-check "0") str->int)
          now (-> (cljs-time.core/now) cljs-time.coerce/to-long)]
      (logf :debug "last: %s now %s" last-check now)
      ;; "tag_name"
      (if (> (- now last-check) 86400000)
        (=>> [:version-check-start])
        (logf :debug "Skipping version check."))))))

(rf/reg-event-fx
 :version-check-start
 (fn []
   {:http {:method     :get
           :uri        "https://api.github.com/repos/kiibohd/configurator/releases/latest"
           :headers    {:user-agent "Kiibohd Configurator"}
           :on-success [:version-check-success]
           :on-failure [:version-check-failure]
           :options    {:response-format (ajax/json-response-format {:keywords? true})}}}
   ))

(rf/reg-event-fx
 :version-check-success
 (fn [cofx [_ response]]
   (let [version (:tag_name response)
         version (str/trim (if (str/starts-with? version "v") (subs version 1) version))
         now (-> (cljs-time.core/now) cljs-time.coerce/to-long)]
     (if (> (ver/version-compare version electron/app-version) 0)
       (=>> [:alert/add
             {:type :warning
              :key  now
              :msg  [:div
                     {:style {:display "flex" :align-items "center"}}

                     [:span {:style    {:cursor          "pointer"
                                        :text-decoration "underline"}
                             :on-click #(.openExternal electron/shell (:html_url response))}
                      (str/fmt "New version available (v%s)! (click to open)" version)]
                     ]}
             ])
       (logf :debug "No new version available: %s : %s" version electron/app-version))
     (=>> [:local/set-last-ver-check now])
     )
   ))

(def dfu-info
  {:version "0.9"
   "win32" "http://dfu-util.sourceforge.net/releases/dfu-util-0.9-win64.zip"
   "darwin" "https://github.com/kiibohd/dfu-util/releases/download/v0.9-kiibohd/dfu-util-v0.9-kiibohd.zip"})

(defn dfu-dl-complete
  [_ arg]
  (let [result (u/jsx->clj arg)]
    (go
      (logf :info (str "completed dfu-util download" result))
      (let [path (<? (store/store-dfu-util (:path result) (:version dfu-info)))]
        (=>> [:local/set-dfu-util-path path])))
    ))

(rf/reg-fx
  :dfu-util-check
  (fn []
    (if-let [loc (get dfu-info js/process.platform)]
      (let [dfu-version (:version dfu-info)]
        ; Check if dfu-util is in local
        (if (store/dfu-util-installed? dfu-version)
          (logf :info (str "dfu-util v" dfu-version " Installed"))
          (let [event-name "dfu-util-download-complete"]
            (logf :warn (str "dfu-util v" dfu-version " NOT Installed"))
            (.once electron/ipc event-name dfu-dl-complete)
            (.send electron/ipc "download-file" loc event-name)))))))

(def zadic-info
  {:version "1.5.2"
   ;; TODO: Generate this from settings.
   :config "[
  {
    \"vid\":    \"0x1c11\",
    \"pid\":    \"0xb04d\",
    \"interface\": 0,
    \"vendor\": \"Input Club\",
    \"driver\": \"libusbK\"
  },
  {
    \"vid\":    \"0x1c11\",
    \"pid\":    \"0xb04d\",
    \"interface\": 5,
    \"vendor\": \"Input Club\",
    \"driver\": \"libusbK\"
  },
  {
    \"vid\":    \"0x1c11\",
    \"pid\":    \"0xb007\",
    \"interface\": 0,
    \"vendor\": \"Input Club\",
    \"driver\": \"libusbK\"
  },
  {
    \"vid\":    \"0x1209\",
    \"pid\":    \"0x01CB\",
    \"interface\": 0,
    \"vendor\": \"Input Club\",
    \"driver\": \"libusbK\"
  },
  {
    \"vid\":    \"0x1209\",
    \"pid\":    \"0x01C0\",
    \"interface\": 0,
    \"vendor\": \"Input Club\",
    \"driver\": \"libusbK\"
  },
  {
    \"vid\":    \"0x308F\",
    \"pid\":    \"0x0012\",
    \"interface\": 0,
    \"vendor\": \"Input Club\",
    \"driver\": \"libusbK\"
  },
  {
    \"vid\":    \"0x308F\",
    \"pid\":    \"0x0013\",
    \"interface\": 0,
    \"vendor\": \"Input Club\",
    \"driver\": \"libusbK\"
  },
  {
    \"vid\":    \"0x308F\",
    \"pid\":    \"0x0013\",
    \"interface\": 5,
    \"vendor\": \"Input Club\",
    \"driver\": \"libusbK\"
  }
]"
   "win32" "https://github.com/kiibohd/kiidrv/releases/download/v1.5.2-kiidrv/kiidrv-x64-Release.exe"
   })

(defn zadic-dl-complete
  [_ arg]
  (let [result (u/jsx->clj arg)]
    (go
      (logf :info (str "completed zadic download" result))
      (let [path (<? (store/store-zadic (:path result) (:version zadic-info) (:config zadic-info)))]
        (=>> [:local/set-zadic-path path])
        )
      )
    ))

;; TODO: Run zadic

(rf/reg-fx
  :zadic-check
  (fn []
    (when-let [loc (get zadic-info js/process.platform)]
      (let [zadic-version (:version zadic-info)]
        (if (store/zadic-installed? zadic-version)
          (logf :info (str "Zadic v" zadic-version " Installed"))
          (let [event-name "zadic-download-complete"]
            (logf :warn (str "Zadic v" zadic-version " NOT Installed"))
            (.once electron/ipc event-name zadic-dl-complete)
            (.send electron/ipc "download-file" loc event-name))
          ))
      )))

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
  (safe-read-string raw "{" #(when (some? %) {:bin %})))

(defn local-read-recent-dl
  [raw]
  (safe-read-string raw "{" (fn [_] {})))

(defn local-read-dfu-util-path
  [raw]
  (safe-read-string raw "\""))

(defn local-read-zadic-path
  [raw]
  (safe-read-string raw "\""))

(defn local-read-canned-animations
  [raw]
  (safe-read-string raw "{" (fn [_] {})))

(rf/reg-fx
 :indexed-db/load
 (fn []
   (go
    (let [dfu-util-path (<? (config/get :dfu-util-path))
          last-dl (<? (config/get :last-download))
          recent-dls (<? (config/get :recent-downloads))
          last-ver-check (<? (config/get :last-version-check))
          canned-animations (<? (config/get :canned-animations))
          zadic-path (<? (config/get :zadic-path))]
      ;(logf :debug "Setting [:dfu-util-path] - %s" dfu-util-path)
      ;(logf :debug "Setting [:last-download] - %s" last-dl)
      ;(logf :debug "Setting [:recent-downloads] - %s" recent-dls)
      (=>> [:db/raw-assoc-in [:local :dfu-util-path] (local-read-dfu-util-path dfu-util-path)])
      (=>> [:db/raw-assoc-in [:local :last-download] (local-read-last-dl last-dl)])
      (=>> [:db/raw-assoc-in [:local :recent-downloads] (local-read-recent-dl recent-dls)])
      (=>> [:db/raw-assoc-in [:local :canned-animations] (local-read-canned-animations canned-animations)])
      (=>> [:db/raw-assoc-in [:local :zadic-path] (local-read-zadic-path zadic-path)])
      (=>> [:db/raw-assoc-in [:local :last-version-check] last-ver-check])
      ))))

(rf/reg-event-db
 :db/raw-assoc-in
 (fn [db [_ keys val]]
   (assoc-in db keys val)))

(rf/reg-event-fx
 :local/set-last-ver-check
 (fn [cofx [_ value]]
   {:db             (assoc-in (:db cofx) [:local :last-version-check] value)
    :indexed-db/set [:last-version-check value]}))

(rf/reg-event-fx
 :local/set-dfu-util-path
 (fn [cofx [_ value]]
   {:db             (assoc-in (:db cofx) [:local :dfu-util-path] value)
    :indexed-db/set [:dfu-util-path value]}))

(rf/reg-event-fx
  :local/set-zadic-path
  (fn [cofx [_ value]]
    {:db             (assoc-in (:db cofx) [:local :zadic-path] value)
     :indexed-db/set [:zadic-path value]}))

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

(rf/reg-event-fx
 :local/update-canned-animations
 (fn [cofx [_ value name]]
   (let [canned (assoc (get-in (:db cofx) [:local :canned-animations]) name value)]
     {:db             (assoc-in (:db cofx) [:local :canned-animations] canned)
      :indexed-db/set [:canned-animations canned]})))

(rf/reg-event-fx
 :local/remove-canned-animation
 (fn [cofx [_ name]]
   (let [canned (dissoc (get-in (:db cofx) [:local :canned-animations]) name)]
     {:db             (assoc-in (:db cofx) [:local :canned-animations] canned)
      :indexed-db/set [:canned-animations canned]}))
 )

(rf/reg-fx
 :indexed-db/set
 (fn [[key value]]
   (config/set key (pr-str value))))