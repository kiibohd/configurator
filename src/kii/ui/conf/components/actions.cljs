(ns kii.ui.conf.components.actions
  (:require [reagent.core :as r]
            [re-frame.core :as rf]
            [cljs-css-modules.macro :refer-macros [defstyle]]
            [kii.ui.conf.subscriptions]
            [kii.ui.conf.palette :as palette]))

(defstyle style
          [".action-bar"
           {:float "right"
            ;;:height "48px"
            :margin-right "-10px"
            :margin-bottom "10px"}]
          [".btn"
           {:margin-right "10px"
            :background-color "transparent"
            :padding "0px"
            :border "none"
            :cursor "pointer"
            :color (:darkgray palette/palette)}
           ["&:active:enabled"
            {:outline "0"
             :opacity "0.75"}]
           ["&:focus"
            {:outline "0"}]
           ])

;;==== Actions ====;;

(defn button-comp
  [icon title disabled? action]
  [:button
   {:class (:btn style)
    :title title
    :on-click action
    :disabled disabled?}
   [:i
    {:class (str "material-icons md-36" (if disabled? " md-inactive"))}
    icon]
   ]
  )

(defn actions-comp
  [changes?]
  [:div
   {:class (:action-bar style)}
   (button-comp "help_outline" "Help" false #(rf/dispatch [:add-alert {:type :warning :msg "Help not implemented yet :("}]))
   (button-comp "undo" "Revert to original" true #(print "Revert clicked!"))
   (button-comp "file_upload" "Import keymap" false #(rf/dispatch [:add-alert {:type :info :msg "Import keymap not implemented yet :("}]))
   (button-comp "file_download" "Download firmware" false #(rf/dispatch [:start-firmware-compile]))
   ])

(defn actions []
  (let [changes? (rf/subscribe [:cfg-changes?])]
    (actions-comp changes?)))
