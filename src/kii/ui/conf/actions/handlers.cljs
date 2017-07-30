(ns kii.ui.conf.actions.handlers
  (:require [re-frame.core :as rf]
            [ajax.core :as ajax]
            [kii.env :as env]
            [kii.util :as u]
            [kii.keys.firmware.map :as fw]
            [kii.config.core :as config]
            [kii.ui.conf.actions.subscriptions :as sub]
            [kii.bindings.electron-renderer :as electron]
            [clojure.pprint]))

(rf/reg-event-fx
  :start-firmware-compile
  (fn [cofx _]
    (do
      ;;(clojure.pprint/pprint cofx)
      (let [db (:db cofx)
            actions (sub/get-current-actions db nil)
            kll (-> db :conf :kll)
            mangled-kll (config/mangle kll)
            ]

        (do
          ;;(clojure.pprint/pprint kll)
          ;;(clojure.pprint/pprint mangled-kll)
          {:db   (assoc-in db [:conf :current-actions] (conj actions :firmware-dl))
           :http {:method     :post
                  :uri        (str env/base-uri "download.php")
                  :on-success [:start-firmware-dl]
                  :on-failure [:firmware-compile-failure]
                  :options    {:params          {"map" (.stringify js/JSON (clj->js mangled-kll))}
                               :format          (ajax/url-request-format)
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
