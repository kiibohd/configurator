(ns kii.ui.conf.handlers
  (:require [re-frame.core :as rf]
            [kii.env :as env]
            [kii.device.keyboard :as keyboard]
            [kii.keys.firmware.map :as fw]
            [kii.keys.core :as keys]
            [ajax.core :as ajax]
            [clojure.pprint]
            [kii.ui.conf.key-group.handlers]
            [kii.ui.conf.actions.handlers]
            [kii.ui.conf.keyboard.handlers]
            [kii.ui.conf.layer-select.handlers]))

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
          layout (:active-layout db)]
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

(defn normalize-layers
  [layers]
  (into
    {}
    (map (fn [[layer data]]
           (let [okey (:key data)
                 ;;olabel (:label data)
                 mapped (fw/alias->key okey)
                 iec (get (keys/key->iec) (:name mapped))]
             ;;(print okey "(" olabel ") =>" mapped)
             ;;(clojure.pprint/pprint iec)
             [layer
              (keys/merge mapped iec)
              #_{:key (:name mapped)
                 :label1 (or (:label1 iec) olabel)
                 :label2 (:label2 iec)
                 :label3 (:label3 iec)}]))
         layers)))

(defn normalize-config
  [config]
  (let [matrix (:matrix config)
        min-left (apply min (map :x matrix))
        min-top (apply min (map :y matrix))]
    (assoc config :matrix
                  (vec (map #(merge % {:x (- (:x %) min-left)
                                       :y (- (:y %) min-top)
                                       :layers (normalize-layers (:layers %))})
                            matrix)))))

(rf/reg-event-fx
  :load-config
  (fn [cofx [_ response]]
    (let [db (:db cofx)
          cfg (or (:conf db) {})
          config (normalize-config response)]
      (do
        ;;(clojure.pprint/pprint response)
        ;;(clojure.pprint/pprint config)
        {:db (assoc db :conf
                       (merge cfg
                              {:loaded? true
                               :active-layer 0
                               :kll config
                               :orig-kll config}))}))))


