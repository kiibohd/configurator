(ns kii.ui.components.manage-canned-animations
  (:require [reagent.core :as r]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [cljs-react-material-ui.reagent :as mui]
            [cuerdas.core :as str]
            [cljs-react-material-ui.icons :as mui-icons]
            [kii.ui.components.popup :refer [custom-popup]]
            [kii.config.core :as config]
            [kii.ui.styling :as styling]))

(defn parse-json [json name]
  (if-let [ani (config/json->animation json)]
    (do (=>> [:local/update-canned-animations ani (keyword "local" name)])
        (logf :debug "Added %s - %s" name ani)
        true)
    false)
  )

(defn name-error [value]
  (cond
    (nil? value) nil
    (= 0 (count (name value))) nil
    (not (config/valid-animation-name? value)) "invalid name - valid characters [A-Za-z0-9_] must not start with number"))

(defn import-popup [visible? default-value name-readonly?]
  [custom-popup
   "pre-defined animation json" visible? default-value
   [{:text      "save"
     :fn        (fn [val]
                  (if (parse-json (:json val) (:name val))
                    (=>> [:alert/add {:type :success :msg "Successfully imported animation!"}])
                    (=>> [:alert/add {:type :error :msg "Could not import, invalid format."}]))
                  (reset! visible? false))
     :disabled? (fn [val] (not (config/valid-animation-name? (:name val))))}
    {:text "cancel"
     :fn   (fn [_] (reset! visible? false))
     :style {:background-color "darkgray"}}]
   (fn [data]
     [:div
      [mui/text-field
       {:style               {:display "block" :width "30em"}
        :default-value       (:name @data)
        :floating-label-text "name"
        :read-only           (true? name-readonly?)
        :error-text          (name-error (:name @data))
        :on-change           (fn [_ val] (swap! data assoc :name val))}]

      [mui/text-field
       {:floating-label-fixed true
        :floating-label-text  "Animation JSON"
        :default-value        (:json @data)
        :disabled             false
        :multi-line           true
        :rows                 24
        :rowsMax              24
        :on-change            (fn [_ val] (swap! data assoc :json val))
        :style                {:display     "block"
                               :width       "calc(100% - 2em)"
                               :font-family styling/monospace-font-stack
                               }
        :textarea-style       {:white-space    "pre"
                               :padding-bottom "1.2em"
                               :padding-left   "5px"
                               :border-left    "1px solid darkgray"
                               :color          "black"
                               :font-size      "1em"}
        :floating-label-style {:font-size "24px"}}
       ]
      ])
   ])

(defn import-animation-button []
  (let [visible? (r/atom false)]
    (fn []
      [:div
       [import-popup visible? {:name "" :json ""} false]

       [mui/icon-button
        {:icon-style {:font-size "36px"}
         :tooltip    "Import animation"
         :on-click   #(reset! visible? true)
         :disabled   false}
        [mui/font-icon
         {:class "material-icons md-36"}
         "file_upload"]
        ]])))

(defn edit-animation-button [name animation]
  (let [visible? (r/atom false)]
    (fn [name animation]
      (let [json (.stringify js/JSON (clj->js animation) nil 4)]
        [:div {:style {:display "inline"}}
         [import-popup visible? {:name name :json json} true]

         [mui/icon-button
          {:tooltip  "Edit animation"
           :on-click #(reset! visible? true)}
          [mui-icons/editor-mode-edit
           {:color       "gray"
            :hover-color "black"}]
          ]]))))


(defn manage-canned-animations []
  (let [animations (<<= [:local/canned-animations])]
    [:div
     [:div {:style {:display         "flex"
                    :justify-content "space-between"
                    :align-items     "center"}}
      [:h3 "Manage Animations"]
      [import-animation-button]
      ]
     [mui/table {:selectable    false
                 :wrapper-style {:margin-right "20px"
                                 :overflow     "visible"}
                 :body-style    {:overflow "visible"}}
      [mui/table-header {:display-select-all  false
                         :adjust-for-checkbox false}
       [mui/table-row
        [mui/table-header-column "Name"]
        [mui/table-header-column "Actions"]
        ]]
      [mui/table-body {:display-row-checkbox false}
       (for [[key animation] (seq animations)]
         ^{:key key}
         [mui/table-row
          {:style {:overflow "visible"}}
          [mui/table-row-column (name key)]
          [mui/table-row-column
           {:style {:overflow "visible"}}
           [mui/icon-button
            {:on-click #(=>> [:local/remove-canned-animation key])
             :tooltip  "Delete animation"}
            [mui-icons/action-delete
             {:color       "gray"
              :hover-color "black"}]]
           [edit-animation-button (name key) animation]
           ]
          ]
         )]]])
  )
