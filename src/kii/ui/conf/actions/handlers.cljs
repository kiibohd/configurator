(ns kii.ui.conf.actions.handlers
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [re-frame.core :as rf]
            [reagent.core :as r]
            [ajax.core :as ajax]
            [cljs.core.async :refer [chan <! >! put! close!]]
            [cljs-react-material-ui.reagent :as mui]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.env :as env]
            [kii.util :as u]
            [kii.keys.firmware.map :as fw]
            [kii.config.core :as config]
            [kii.ui.conf.actions.subscriptions :as sub]
            [kii.bindings.electron-renderer :as electron]
            [kii.store :as store]
            [kii.macros :refer-macros [<?]]
            [kii.ui.config]
            [kii.ui.components.popup :refer [popup]]
            [cljs-node-io.core :as io]))

(rf/reg-event-fx
  :start-firmware-compile
  (fn [cofx _]
    (do
      (let [db (:db cofx)
            kll (-> db :conf :kll)
            mangled-kll (config/mangle kll)
            ]
        {:dispatch [:start-action :firmware-dl]
         :http     {:method     :post
                    :uri        (str env/base-uri "download.php")
                    :on-success [:start-firmware-dl]
                    :on-failure [:firmware-compile-failure]
                    :options    {:params          {:config mangled-kll
                                                   :env    "latest"}
                                 :format          (ajax/json-request-format)
                                 :response-format (ajax/json-response-format
                                                    {:keywords? true})}}
         }))))

(rf/reg-event-db
  :start-action
  (fn [db [_ action-name]]
    (update-in db [:conf :current-actions] #(conj (or % #{}) action-name))))

(rf/reg-event-db
  :finish-action
  (fn [db [_ action-name]]
    (update-in db [:conf :current-actions] #(disj (or % #{}) action-name))))

(defn dl-complete
  [_ arg]
  (let [result (u/jsx->clj arg)]
    (rf/dispatch [:download-complete result])))

(rf/reg-event-fx
  :start-firmware-dl
  (fn [cofx [_ response]]
    (.once electron/ipc "download-complete" dl-complete)
    ;; Wait half a second (HACK for Issue #22 -- remove when backend re-written)
    (js/setTimeout
      #(.send electron/ipc "download-file" (str env/base-uri (:filename response)))
      500)
    {}))

(rf/reg-event-fx
  :firmware-compile-failure
  (fn [{:keys [db]} [_ response]]
    (logf :warn "Firmware compilation failed %s" (js->clj (-> response :response :error)))
    {:dispatch-n (list [:finish-action :firmware-dl]
                       [:alert/add {:type :error :msg (str "Compilation Failed: " (-> response :response :error))}])}
    ))

(defn dl-success
  [dl path]
  [:alert/add
   {:type :success
    :key  (:time dl)
    :msg  [:div
           {:style {:display "flex" :align-items "center"}}

           [:span {:style    {:cursor          "pointer"
                              :text-decoration "underline"}
                   :on-click #(.showItemInFolder electron/shell path)}
            "Completed download! (click to open)"]

           [mui/raised-button
            {:label       "Flash"
             :style       {:margin-left "10px" :min-width "72px"}
             :label-style {:vertical-align "baseline" :padding-left "8px" :padding-right "8px"}
             :on-click    (fn []
                            ;; TODO: Update the firmware
                            (=>> [:alert/remove-all])
                            (=>> [:panel/set-active :flash])
                            )}]
           ]}])

(defn dl-failed-comp
  [dl path]
  (let [visible? (r/atom false)
        contents (r/atom (io/slurp (:log dl)))]
    (fn [dl path]
      [:div
       {:style {:display "flex" :align-items "center"}}
       [popup
        "build log" visible? true @contents
        [{:text "close"
          :fn   #(reset! visible? false)}]
        ]

       [:span {:style    {:cursor          "pointer"
                          :text-decoration "underline"}
               :on-click #(.showItemInFolder electron/shell path)}
        "Firmware Compilation Failed (click to open)"]

       [mui/raised-button
        {:label       "view log"
         :style       {:margin-left "10px" :min-width "72px"}
         :label-style {:vertical-align "baseline" :padding-left "8px" :padding-right "8px"}
         :on-click    (fn [] (reset! visible? true))}]
       ])))

(defn dl-failed
  [dl path]

  [:alert/add
   {:type :error
    :key  (:time dl)
    :msg  [dl-failed-comp dl path]}]
  )

(rf/reg-event-fx
  :download-complete
  (fn [{:keys [db]} [_ {:keys [status path error]}]]
    (case status
      "success" (do
                  (go
                    (let [cached (<! (store/cache-firmware path))]
                      (=>> [:local/set-last-download cached])
                      (=>> [:local/add-recent-downloads cached])
                      (=>> (if (not= :error (:result cached))
                             (dl-success cached path)
                             (dl-failed cached path)))
                      ))
                  {:dispatch [:finish-action :firmware-dl]})
      "error" (do
                (logf :error "Failed to download file %s" error)
                {:dispatch-n (list [:finish-action :firmware-dl]
                                   [:alert/add {:type :error :msg "Failed to download"}])}))
    ))
