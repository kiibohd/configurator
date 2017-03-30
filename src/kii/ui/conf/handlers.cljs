(ns kii.ui.conf.handlers
  (:require [re-frame.core :as rf]
            [kii.env :as env]
            [kii.util :as u]
            [kii.device.keyboard :as keyboard]
            [kii.device.keymap :as keymap]
            [kii.device.keys :as ickeys]
            [kii.ui.conf.subscriptions :as conf-sub]
            [kii.bindings.electron-renderer :as electron]
            [ajax.core :as ajax]
            [clojure.pprint]))

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

(defn get-key-map
  [ic-key iec-key]
  {:key (:name ic-key)
   :label1 (or (:label1 iec-key) (:label ic-key))
   :label2 (:label2 iec-key)
   :label3 (:label3 iec-key)})

(defn normalize-layers
  [layers]
  (into
    {}
    (map (fn [[layer data]]
           (let [okey (:key data)
                 ;;olabel (:label data)
                 mapped (ickeys/alias->key okey)
                 iec (get keymap/en-us->iec9995 (:name mapped))]
             ;;(print okey "(" olabel ") =>" mapped)
             ;;(clojure.pprint/pprint iec)
             [layer
              (get-key-map mapped iec)
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

(defn set-active-layer
  [db [_ value]]
  (assoc-in db [:conf :active-layer] value))

(rf/reg-event-db :set-active-layer set-active-layer)

(defn set-selected-key
  [db [_ value]]
  (assoc-in db [:conf :selected-key] value))

(rf/reg-event-db :set-selected-key set-selected-key)

;; TODO: Keypress pipline
;;  Most easily accomplished by simply adding items to a "pressed"
;;  array and then waiting to fire an action until after the last
;;  key is released or a timeout occurs.
;;  This would be important for keys that are not 1:1 mappings in
;;  some layouts (not as important if we have an on-screen keyboard.
(defn handle-keyup
  [db [_ value]]
  db)

(defn handle-keypress
  [db [_ value]]
  db)

(defn get-iec9995
  [key-event]
  (let [e (:event key-event)
        loc (:location e)
        key-code (:key-code key-event)
        adj-key-code (+ (* 1000 loc) key-code)
        key (get keymap/en-us-keycode->iec9995 key-code)
        adj-key (get keymap/en-us-keycode->iec9995 adj-key-code)]
    ;;(print "Key Down - " key-code)
    ;;(print "Adjusted Key Code - " adj-key-code)
    ;;(print "Key " key)
    ;;(print "Adj Key" adj-key)
    (or adj-key key)))

(defn handle-keydown
  [db [_ value]]
  (if-let [selected-key (conf-sub/get-selected-key db nil)]
    (let [iec9995-loc (get-iec9995 value)
          mapped (get keymap/iec9995->en-us iec9995-loc)
          predef (get ickeys/predefined (:key mapped))
          active-layer (conf-sub/get-active-layer db nil)
          matrix (conf-sub/get-matrix db nil)
          new-key (assoc-in
                    selected-key
                    [:layers (keyword (str active-layer))]
                    (get-key-map predef mapped))
          new-matrix (->> matrix
                          (map
                            (fn [key]
                              (if (= key selected-key)
                                new-key
                                key)))
                          vec)]
      ;;(print "mapped -> " mapped)
      ;;(print "predef -> " predef)
      ;; TODO: Replace with emitting two events:
      ;;       1. Set Key
      ;;       2. Set Selected Key
      (-> db
          (assoc-in [:conf :kll :matrix] new-matrix)
          (assoc-in [:conf :selected-key] new-key)))
    db))

(rf/reg-event-db :window/keyup handle-keyup)
(rf/reg-event-db :window/keydown handle-keydown)
(rf/reg-event-db :window/keypress handle-keypress)

(defn update-selected-key
  [db [_ new-key]]
  db
  #_(let []
      (-> db
          (assoc-in [:conf :kll :matrix] new-matrix)
          (assoc-in [:conf :selected-key] new-key)))
  )

(rf/reg-event-db :update-selected-key update-selected-key)

(defn de-key [m f]
  (into
    {}
    (map (fn [[k v]] [(name k) (if f (f k v) v)]) m)))

(defn mangle-layer
  [n layer]
  (do
    ;;(clojure.pprint/pprint n)
    ;;(clojure.pprint/pprint layer)
    (let [k (get ickeys/predefined (:key layer))]
      {"key" (-> k :aliases first)
       "label" (:label k)})))

(defn mangle-config
  [config]
  {"header" (de-key (:header config) nil)
   "defines" {}
   "matrix" (map (fn [key]
                   (do
                     ;;(clojure.pprint/pprint key)
                     (de-key
                       key
                       (fn [k v]
                         (if (= k :layers)
                           (let [layers (into {} (filter #(-> % second :key some?) v))]
                             ;;(clojure.pprint/pprint v)
                             ;;(clojure.pprint/pprint layers)
                             (de-key layers mangle-layer))
                           v)))))
                 (:matrix config))})

(rf/reg-event-fx
  :start-firmware-compile
  (fn [cofx _]
    (do
      ;;(clojure.pprint/pprint cofx)
      (let [db (:db cofx)
            actions (conf-sub/get-current-actions db nil)
            kll (-> db :conf :kll)
            mangled-kll (mangle-config kll)
            ]

        (do
          ;;(clojure.pprint/pprint kll)
          ;;(clojure.pprint/pprint mangled-kll)
          {:db (assoc-in db [:conf :current-actions] (conj actions :firmware-dl))
           :http {:method :post
                  :uri (str env/base-uri "download.php")
                  :on-success [:start-firmware-dl]
                  :on-failure [:firmware-compile-failure]
                  :options {:params {"map" (.stringify js/JSON (clj->js mangled-kll))}
                            :format (ajax/url-request-format)
                            :response-format (ajax/json-response-format
                                               {:keywords? true})}}
           })
        ))))

(defn dl-complete
  [_ arg]
  (let [result (u/jsx->clj arg)]
    (print (str "Download complete: " result))
    (rf/dispatch [:download-complete result])))

(rf/reg-event-fx
  :start-firmware-dl
  (fn [cofx [_ response]]
    (do
      (clojure.pprint/pprint response)
      (.once electron/ipc
             "download-complete"
             dl-complete)
      (.send electron/ipc
             "download-file"
             (str env/base-uri (:filename response)))
      )))

(rf/reg-event-fx
  :download-complete
  (fn [{:keys [db]} [_ {:keys [status path error]}]]
    (do
      (print (str "status: " status))
      (print (str "path: " path))
      (print (str "error: " error))
      (case status
        "success" {:dispatch [:alert/add {:type :success :msg (str "Completed download: " path)}]}
        "error" {:dispatch [:alert/add {:type :error :msg "Failed to download"}]}))
    ))

(rf/reg-event-db
  :toggle-key-group-state
  (fn [db [_ group]]
    (update-in db
               [:conf :key-group-states group]
               (fnil #(if (= :visible %) :hidden :visible) :visible))))
