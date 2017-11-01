(ns kii.ui.conf.components.manage-animations
  (:require [reagent.core :as r]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [cljs-react-material-ui.reagent :as mui]
            [cljs-react-material-ui.icons :as mui-icons]
            [cuerdas.core :as str]
            [kii.util :as util]
            ))

(defn alter-settings
  [setting f]
  (as-> setting x
        (str/split x ",")
        (f x)
        (str/join "," x)))

(defn manage-animations
  []
  (let [animations (<<= [:conf/animations])]
    [:div
     [:h3 "Manage Visualizations"]
     [mui/table {:selectable false
                 :wrapper-style {:margin-right "20px"}
                 }
      [mui/table-header {:display-select-all false
                         :adjust-for-checkbox false}
       [mui/table-row
        [mui/table-header-column "Name"]
        [mui/table-header-column "Auto-start?"]
        [mui/table-header-column "Actions"]
        ]
          ]
      [mui/table-body {:display-row-checkbox false}
       (for [[key animation] (seq animations)]
         ^{:key key}
         [mui/table-row
          [mui/table-row-column (name key)]
          [mui/table-row-column
           [mui/toggle
            {:default-toggled (str/includes? (:settings animation) "start")
             :disabled        (= "reaction" (:type animation))
             :on-toggle       (fn [_ toggled]
                                (>=> [:conf/partial-update-animation
                                      {:settings (alter-settings
                                                   (:settings animation)
                                                   (if toggled
                                                     #(conj % "start")
                                                     (fn [x] (filter #(not= (str/trim %) "start") x))))}
                                      key])
                                )
             }]
           ]
          [mui/table-row-column
           [mui/icon-button
            {:on-click #(>=> [:conf/delete-animation key])}
            [mui-icons/action-delete
             {:color       "gray"
              :hover-color "black"}
             ]
            ]
           ]
          ]
         )]]
     ]))