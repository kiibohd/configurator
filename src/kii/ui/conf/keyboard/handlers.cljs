(ns kii.ui.conf.keyboard.handlers
  (:require [re-frame.core :as rf]
            [kii.keys.firmware.map :as fw]
            [kii.keys.core :as keys]
            [kii.ui.conf.util :as conf-util]
            [kii.ui.conf.subscriptions :as conf-sub]
            [kii.ui.conf.layer-select.subscriptions :as ls-sub]))

(defn update-matrix
  [new-key matrix selected-key]
  (mapv
    #(if (= %1 selected-key)
       new-key
       %1)
    matrix)
  )

(defn set-selected-key
  [db [_ value]]
  (assoc-in db [:conf :selected-key] value))

(rf/reg-event-db :set-selected-key set-selected-key)

;; TODO: Move keypress logic to emit this event
(defn update-selected-key
  [db [_ keyname]]
  #_db
  (if-let [selected-key (conf-util/get-selected-key db)]
    (let [predef (get fw/keys keyname)
          mapped (get (keys/key->iec) keyname)
          matrix (conf-sub/get-matrix db nil)
          active-layer (ls-sub/get-active-layer db nil)
          new-key (assoc-in
                    selected-key
                    [:layers (keyword (str active-layer))]
                    (keys/merge predef mapped))
          new-matrix (update-matrix new-key matrix selected-key)]
      ;; TODO: Replace with emitting two events:
      (-> db
          (assoc-in [:conf :kll :matrix] new-matrix)
          (assoc-in [:conf :selected-key] new-key)))

    db)
  )

(rf/reg-event-db :update-selected-key update-selected-key)

;; TODO: Keypress pipeline
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
        key (get (keys/code->iec) key-code)
        adj-key (get (keys/code->iec) adj-key-code)]
    (or adj-key key)))

(defn handle-keydown
  [db [_ value]]
  (if (= :keys (conf-util/get-active-config-tab db))
    (let [iec-loc (get-iec9995 value)
          mapped (get (keys/iec->key) iec-loc)]
      (update-selected-key db [nil (:key mapped)]))
    db))

(rf/reg-event-db :window/keyup handle-keyup)
(rf/reg-event-db :window/keydown handle-keydown)
(rf/reg-event-db :window/keypress handle-keypress)
