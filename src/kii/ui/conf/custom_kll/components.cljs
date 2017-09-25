(ns kii.ui.conf.custom-kll.components
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [clojure.pprint]))

(defstyle css
  [".editor"
   {:resize "none"
    :width "calc(100% - 2em)"
    :display "block"
    :overflow "auto"
    }])

(defn count-newlines [a]
  (r/track (fn []
             (count (re-seq #"\n" @a)))))

(defn kll-editor [active-layer custom]
  (r/with-let [a (r/atom custom)
               r (count-newlines a)]
              [:div
               [:textarea
                {:key active-layer
                 :rows (+ 10 @r)
                 :class (:editor css)
                 :default-value custom
                 :on-blur #(rf/dispatch-sync [:conf/custom-kll @a])
                 :on-change #(do
                               (reset!
                                a (.. % -target -value)))}]]))

(defn custom-kll-comp
  [active-layer custom]
  [:div
   [:h3 "Custom KLL"]
   [kll-editor active-layer custom]
   ])

(defn custom-kll []
  (let [active-layer (rf/subscribe [:conf/active-layer])
        custom (rf/subscribe [:conf/custom-kll])]
    [custom-kll-comp @active-layer @custom]))