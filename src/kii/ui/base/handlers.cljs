(ns kii.ui.base.handlers
  (:require [re-frame.core :as rf]))

(defn set-active-panel [db [_ value]]
  (assoc db :active-panel value))

(rf/reg-event-db :panel/set-active set-active-panel)

(defn set-active-layout
  [db [_ layout]]
  (assoc db :active-layout layout))

(rf/reg-event-db :layout/set-active set-active-layout)
