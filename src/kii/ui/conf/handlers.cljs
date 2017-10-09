(ns kii.ui.conf.handlers
  (:require [re-frame.core :as rf]
            [kii.env :as env]
            [kii.device.keyboard :as keyboard]
            [kii.keys.firmware.map :as fw]
            [kii.keys.core :as keys]
            [kii.config.core :as config]
            [ajax.core :as ajax]
            [clojure.pprint]
            [clojure.string]
            [kii.ui.conf.key-group.handlers]
            [kii.ui.conf.actions.handlers]
            [kii.ui.conf.keyboard.handlers]
            [kii.ui.conf.layer-select.handlers]
            [kii.ui.conf.config-tabs.handlers]
            [kii.ui.conf.custom-kll.handlers]))

(def default-conf
  {:mode         :keymap
   :active-layer 0
   :ui-settings  {:backdrop-padding 20
                  :size-factor      16
                  :cap-size-factor  13}})

;; === Navigation === ;;
(defn nav-home
  [db [_ value]]
  (assoc db
    :active-keyboard nil
    :active-panel    :home
    :conf            {}))
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
  [db [_ data]]
  (let [selected (-> db :conf :selected-animation)]
    (-> db (update-in [:conf :kll :animations selected] merge data))))
(rf/reg-event-db :conf/partial-update-animation partial-update-animation)

;; === Reset KLL === ;;
(defn reset-kll
  [db [_ setting value]]
  (let [conf (:conf db)
        orig-kll (:orig-kll conf)
        db' (assoc db :conf (merge conf {:kll orig-kll
                                         :active-layer 0}))]
    db'))

(rf/reg-event-db :conf/reset reset-kll)

;; === Configuration Loading === ;;
(def ajax-methods {:post ajax/POST
                   :get  ajax/GET})
(rf/reg-fx
  :http
  (fn [{:keys [method uri options
               on-success on-failure]}] ; options - as expected by ajax calls
    (let [m-fn (method ajax-methods)]
      (m-fn uri (-> options
                    (assoc :handler       #(rf/dispatch (conj on-success %))
                           :error-handler #(rf/dispatch (conj on-failure %))))))))

(rf/reg-event-fx
  :start-configurator
  (fn [cofx _]
    (let [db (:db cofx)
          kbd (-> db
                  :active-keyboard
                  :product
                  keyboard/product->keyboard
                  :names
                  first)
          layout (clojure.string/replace (:active-layout db) " " "")]
      {:db   (assoc db :conf {:loaded? false})
       :http {:method     :get
              :uri        (str env/base-uri "layouts/" kbd "-" layout ".json")
              :on-success [:load-config]
              :on-failure [:load-config-failure]
              :options    {:format          (ajax/json-request-format)
                           :response-format (ajax/json-response-format {:keywords? true})}
              }}
      )))

(rf/reg-event-fx
  :load-config
  (fn [cofx [_ response]]
    (let [db (:db cofx)
          cfg (or (:conf db) {})
          config (config/normalize response)]
      (do
        {:db (assoc db :conf
                       (merge cfg
                              default-conf
                              {:loaded? true
                               :kll config
                               :orig-kll config}))}))))
