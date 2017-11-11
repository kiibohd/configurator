(ns kii.ui.conf.handlers
  (:require [re-frame.core :as rf]
            [kii.env :as env]
            [kii.util :refer [update-values]]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.device.keyboard :as keyboard]
            [kii.keys.firmware.map :as fw]
            [kii.keys.core :as keys]
            [kii.config.core :as config]
            [ajax.core :as ajax]
            [clojure.string]
            [kii.ui.conf.util :as conf-util]
            [kii.ui.conf.key-group.handlers]
            [kii.ui.conf.actions.handlers]
            [kii.ui.conf.keyboard.handlers]
            [kii.ui.conf.layer-select.handlers]
            [kii.ui.conf.custom-kll.handlers]
            [kii.ui.conf.subscriptions :as conf-sub]
            [kii.ui.conf.layer-select.subscriptions :as ls-sub]
            [cuerdas.core :as str]
            [kii.ui.util :as util]))

(def default-conf
  {:mode         :keymap
   :active-layer 0
   :ui-settings  {:backdrop-padding 20
                  :size-factor      16
                  :cap-size-factor  13
                  :led-factor       17}})

;; === Navigation === ;;
(defn nav-home
  [db [_ value]]
  (assoc db
    :active-keyboard nil
    :active-panel :keyboard-select
    :conf {}))
(rf/reg-event-db :nav/home nav-home)

;; === Configuration Mode === ;;
(defn update-mode
  [db [_ value]]
  (assoc-in db [:conf :mode] value))

(rf/reg-event-db :conf/mode-update update-mode)

;; === Settings/Headers === ;;
(defn update-setting
  [db [_ setting value]]
  (let [db' (assoc-in db [:conf :kll :header setting]
                      value)]
    db'))
(rf/reg-event-db :settings/update update-setting)

;; === Defines === ;;
(defn add-define
  [db [_ value]]
  (let [db' (update-in db [:conf :kll :defines]
                       #(conj % {:id (random-uuid) :data {:name "" :value ""}}))]
    db'))
(rf/reg-event-db :defines/add add-define)

(defn update-define
  [db [_ {:keys [id name value]}]]
  (let [db' (update-in db [:conf :kll :defines]
                       (fn [v] (mapv #(if (= (:id %) id)
                                        (assoc % :data {:name name :value value})
                                        %)
                                     v)))]
    db'))
(rf/reg-event-db :defines/update update-define)

(defn remove-define
  [db [_ id]]
  (let [db' (update-in db [:conf :kll :defines]
                       (fn [v] (filterv #(not= (:id %) id) v)))]
    db'))
(rf/reg-event-db :defines/remove remove-define)

;; === LEDs === ;;

(rf/reg-event-db :conf/set-led-status
                 (fn [db [_ values action]]
                   (case action
                     :append (update-in db conf-util/led-status #(merge % values))
                     :overwrite (assoc-in db conf-util/led-status values)
                     db)))

(rf/reg-event-db :conf/set-selected-leds
                 (fn [db [_ values action]]
                   (let [leds (into {} (for [v (if (vector? values) values [values])]
                                         [(:id v) v]))]
                     (case action
                       :append (update-in db conf-util/selected-leds-path #(merge % leds))
                       :overwrite (assoc-in db conf-util/selected-leds-path leds)
                       db))))

;; === Animations === ;;

(defn set-selected-animation
  [db [_ name]]
  (assoc-in db [:conf :selected-animation] name))
(rf/reg-event-db :conf/set-selected-animation set-selected-animation)

(defn add-animation
  [db [_ name data]]
  (-> db
      (update-in [:conf :kll :animations] #(assoc % name data))
      (assoc-in [:conf :selected-animation] name)))
(rf/reg-event-db :conf/add-animation add-animation)

(defn partial-update-animation
  [db [_ data name]]
  (let [name (or name (-> db :conf :selected-animation))]
    (-> db (update-in [:conf :kll :animations name] merge data))))
(rf/reg-event-db :conf/partial-update-animation partial-update-animation)

(defn contains-animation
  [name line]
  (or
   (str/includes? line (str/fmt "A[%s]" name))
   (str/includes? line (str/fmt "A[%s," name))))

(defn delete-animation
  [db [_ name]]
  (let [sname (clojure.core/name name)]
    (-> db
        (update-in [:conf :kll :animations] #(dissoc % name))
        (update-in
         [:conf :kll :custom]
         (fn [m]
           (update-values
            m
            (fn [value]
              (as-> value x
                    (str/rtrim x)
                    (str/split x ";")
                    (filterv #(not (or (contains-animation sname %)
                                       (-> str/trim str/empty-or-nil?))) x)
                    (conj x "")
                    (str/join ";" x))))))
        (update-in
         [:conf :kll :matrix]
         (fn [m]
           (mapv
            (fn [key]
              (update key :triggers
                      (fn [layers]
                        (into {}
                              (map (fn [[layer triggers]]
                                     [layer (filterv #(not (contains-animation sname (:action %))) triggers)])
                                   layers))

                        )))
            m))))))


(rf/reg-event-db :conf/delete-animation delete-animation)

;; === Triggers === ;;


(defn modify-selected-key
  [f db]
  (if-let [selected-key (conf-util/get-selected-key db)]
    (let [matrix (conf-sub/get-matrix db nil)
          active-layer (keyword (str (ls-sub/get-active-layer db nil)))
          new-key (f selected-key)
          new-matrix (kii.ui.conf.keyboard.handlers/update-matrix new-key matrix selected-key)]
      ;; TODO: Replace with emitting two events:
      (-> db
          (assoc-in [:conf :kll :matrix] new-matrix)
          (assoc-in [:conf :selected-key] new-key)))
    db)
  )

(rf/reg-event-db :conf/add-trigger
                 (fn [db [_ trigger]]
                   (let [active-layer (keyword (str (ls-sub/get-active-layer db nil)))]
                     (modify-selected-key
                      (fn [key] (update-in key [:triggers active-layer] #(conj % trigger)))
                      db))
                   )
                 )

(rf/reg-event-db :conf/remove-trigger
                 (fn [db [_ trigger]]
                   (let [active-layer (keyword (str (ls-sub/get-active-layer db nil)))
                         without (fn [coll] (filterv #(not= % trigger) coll))]
                     (modify-selected-key
                      (fn [key] (update-in key [:triggers active-layer] without))
                      db))
                   ))

;; === Reset KLL === ;;
(defn reset-kll
  [db [_ setting value]]
  (let [conf (:conf db)
        orig-kll (:orig-kll conf)
        db' (assoc db :conf (merge conf {:kll          orig-kll
                                         :active-layer 0}))]
    db'))

(rf/reg-event-db :conf/reset reset-kll)

;; === Config Tabs === ;;

(defn set-active-layer
  [db [_ value]]
  (assoc-in db [:conf :active-config-tab] value))

(rf/reg-event-db :conf/set-active-config-tab set-active-layer)

;; === Configuration Loading === ;;
(def ajax-methods {:post ajax/POST
                   :get  ajax/GET})
(rf/reg-fx
 :http
 (fn [{:keys [method uri options
              on-success on-failure]}]                      ; options - as expected by ajax calls
   (let [m-fn (method ajax-methods)]
     (m-fn uri (-> options
                   (assoc :handler #(rf/dispatch (conj on-success %))
                          :error-handler #(rf/dispatch (conj on-failure %))))))))

(rf/reg-event-fx
 :start-configurator
 (fn [cofx [_ load-last?]]
   (let [db (:db cofx)
         kbd (util/active-keyboard-name db)
         variant (clojure.string/replace (:active-variant db) " " "")
         layout (:active-layout db)
         ]
     {:db   (assoc db :conf {:loaded? false})
      :http {:method     :get
             :uri        (str env/base-uri "layouts/" kbd "-" layout ".json")
             :on-success (if load-last? [:load-last-config] [:load-config])
             :on-failure [:load-config-failure]
             :options    {:format          (ajax/json-request-format)
                          :response-format (ajax/json-response-format {:keywords? true})}
             }}
     )))

(defn build-conf
  [current config]
  (merge current default-conf
         {:loaded? true
          :kll config
          :orig-kll config}))

(rf/reg-event-fx
 :load-last-config
 (fn [cofx [_ response]]
   (let [db (:db cofx)
         cfg (merge {:canned (:canned response)} (:conf db))
         recent-downloads (get-in db [:local :recent-downloads])
         last-dl (first (get-in recent-downloads [(util/active-keyboard-name db) (:active-variant db)]))
         raw (and last-dl (config/file->config (:json last-dl)))
         config (config/normalize (or raw response))]
     {:db (assoc db :conf (build-conf cfg config))})
   ))

(rf/reg-event-fx
 :load-config
 (fn [cofx [_ response]]
   (let [db (:db cofx)
         cfg (or (:conf db) {})
         config (config/normalize response)
         cfg (merge {:canned (:canned response)} cfg)]
     {:db (assoc db :conf (build-conf cfg config))})))
