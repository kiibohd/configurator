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

(defn nav-home
  [db [_ value]]
  (assoc db
    :active-keyboard nil
    :active-panel    :home
    :conf            {}))

(rf/reg-event-db :nav/home nav-home)

(defn update-mode
  [db [_ value]]
  (assoc-in db [:conf :mode] value))

(rf/reg-event-db :conf/mode-update update-mode)

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


(defn update-setting
  [db [_ setting value]]
  (let [db' (assoc-in db [:conf :kll :header setting]
                      value)]
    db'))

(rf/reg-event-db :settings/update update-setting)

(defn remove-define
  [db [_ id]]
  (let [db' (update-in db [:conf :kll :defines]
                       (fn [v] (filterv #(not= (:id %) id) v)))]
    db'))

(rf/reg-event-db :defines/remove remove-define)


(defn reset-kll
  [db [_ setting value]]
  (let [conf (:conf db)
        orig-kll (:orig-kll conf)
        db' (assoc db :conf (merge conf {:kll orig-kll
                                         :active-layer 0}))]
    db'))

(rf/reg-event-db :conf/reset reset-kll)

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
      {:db (assoc db :conf {:loaded? false})
       :http {:method :get
              :uri (str env/base-uri "layouts/" kbd "-" layout ".json")
              :on-success [:load-config]
              :on-failure [:load-config-failure]
              :options {:format (ajax/json-request-format)
                        :response-format (ajax/json-response-format {:keywords? true})
                        }
              }}
      )))

(rf/reg-event-fx
  :load-config
  (fn [cofx [_ response]]
    (let [db (:db cofx)
          cfg (or (:conf db) {})
          config (config/normalize response)]
      (do
        ;;(clojure.pprint/pprint response)
        ;;(clojure.pprint/pprint config)
        {:db (assoc db :conf
                       (merge cfg
                              default-conf
                              {:loaded? true
                               :kll config
                               :orig-kll config}))}))))


