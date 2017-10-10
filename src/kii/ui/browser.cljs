(ns kii.ui.browser
  (:require [goog.events :as events]
            [re-frame.core :as rf]
            [kii.util :as u])
  (:import [goog.events EventType]))

(defonce *registered-events*
  (atom {}))

(defn- register-event
  [type event translate]
  (let [prev (get @*registered-events* type)
        next (events/listen js/window type #(rf/dispatch [event (translate %)]))]
    (when (not (nil? prev)) (events/unlistenByKey prev))
    (swap! *registered-events* assoc type next)))

(defn event->clj
  [evnt]
  (u/jsx->clj evnt :members [:event]))

(defn register-keypress-events []
  (do
    (register-event EventType.KEYDOWN :window/keydown event->clj)
    (register-event EventType.KEYUP :window/keyup event->clj)
    (register-event EventType.KEYPRESS :window/keypress event->clj)))
