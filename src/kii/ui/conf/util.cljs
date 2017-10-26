(ns kii.ui.conf.util)

(defn get-size
  "Get the size of the area needed to display the supplied key matrix"
  [matrix ui-settings]
  (let [right-most (apply max-key #(+ (:x %) (:w %)) matrix)
        bottom-most (apply max-key #(+ (:y %) (:h %)) matrix)
        sf (:size-factor ui-settings)]
    {:height (* sf (+ (:y bottom-most) (:h bottom-most)))
     :width  (* sf (+ (:x right-most) (:w right-most)))}
    ))

(def leds-path [:conf :kll :leds])

(def led-status [:conf :led-status])

(def selected-leds-path [:conf :selected-leds])

(defn get-selected-key
  [db]
  (-> db :conf :selected-key))

(defn get-active-config-tab
  [db]
  (or (-> db :conf :active-config-tab) :keys))
