(ns kii.ui.components.toolbar
  (:require [reagent.core :as r]
            [kii.ui.conf.palette :as palette]
            [cljs-react-material-ui.reagent :as mui]))

(def menu-items (r/atom (list)))

(defn- replace-in-list
  [lst item]
  (map (fn [x]
            (if (= (:name x) (:name item))
              item
              x))
          lst))

(defn add-to-menu
  [& items]
  (swap!
   menu-items
   #(reduce
     (fn [lst v]
       (if (some (fn [x] (= (:name v) (:name x))) lst)
         (replace-in-list lst v)
         (conj lst v)))
     %
     (reverse items))))

(defn remove-from-menu
  [& names]
  (letfn [(keep? [x]
            (not-any? #(= (:name x) %) names))]
    (swap!
     menu-items
     #(filter keep? %))))

(defn replace-in-menu
  [item]
  (swap! menu-items #(replace-in-list % item)))

(defn toolbar []
  (r/with-let [r-menu-items (r/atom @menu-items)]
    (add-watch menu-items :r-menu-items (fn [key atom old-state new-state] (reset! r-menu-items new-state)))
    (fn []
      [:div {:style {:display "inline-flex" :align-items "center"}}
       (for [item @menu-items]
         ^{:key (:name item)}
         [(:component item)] ) ] )) )
