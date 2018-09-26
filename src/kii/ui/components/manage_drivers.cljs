(ns kii.ui.components.manage-drivers
  (:require-macros [cljs.core.async.macros :refer [go go-loop]])
  (:require [reagent.core :as r]
            [cljs.core.async :refer [chan <! >! put! close!]]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [kii.ui.re-frame :refer [<<= <== =>> >=>]]
            [kii.ui.mui :as kii-mui]
            [kii.bindings.electron-renderer :refer [child-process]]
            [cljs-react-material-ui.reagent :as mui]
            [kii.ui.styling :as styling]
            [kii.bindings.node.path :as path]
            [cuerdas.core :as str]
            [kii.bindings.node.fs :as fs]))

(defn run-kiidrv
  [zadic-path sub-cmd append-info-fn]
  (let [zadic-dir (-> zadic-path path/parse :dir)
        dq (fn [s] (str "\"" s "\""))
        cmd (.execFile child-process (dq zadic-path)
                       #js ["--out" "output.log"
                            (str "--" sub-cmd)
                            ]

                       #js {"shell" true
                            "cwd"   zadic-dir
                            "windowsHide" true}

                       (fn [error stdout stderr]
                         (logf :warn "error: '%s'" error)
                         (logf :warn "stdout: '%s'" stdout)
                         (logf :warn "stderr: '%s'" stderr)

                         (if error
                           (append-info-fn (str "\n\nkiidrv returned failure code \n\t" error))
                           (do
                             (append-info-fn stdout)
                             (when (and stderr (not= stderr ""))
                               (append-info-fn (str stderr))
                               )
                             )
                           )
                         )
                       )
        ]
    (.on cmd "exit"
         (fn [code signal]
           (logf :warn "code: '%s', signal: '%s'" code signal)
           (let [contents (fs/read-file! (path/join zadic-dir "output.log"))]
             (append-info-fn contents))
           ))
    )
  )

(defn run-fix-button [on-click-fn]
  (let [zadic-path (<<= [:local/zadic-path])]
    (fn [on-click-fn]
      [:div
       [mui/icon-button
        {:icon-style {:font-size "36px"}
         :tooltip    "Fix Drivers"
         :on-click   on-click-fn
         :disabled   false}
        [mui/font-icon
         {:class "material-icons md-36"}
         "update"]
        ]])))

(defn run-verify-button [on-click-fn]
  (let [zadic-path (<<= [:local/zadic-path])]
    (fn [on-click-fn]
      [:div
       [mui/icon-button
        {:icon-style {:font-size "36px"}
         :tooltip    "Verify Drivers"
         :on-click   on-click-fn
         :disabled   false}
        [mui/font-icon
         {:class "material-icons md-36"}
         "search"]
        ]])))

(defn manage-drivers
  []
  (let [zadic-path (<<= [:local/zadic-path])]
    (r/with-let [status (r/atom :none)
                 visible? (r/atom false)
                 info (r/atom "")
                 set-visibility #(reset! visible? %)
                 clear-info #(reset! info "")
                 append-info #(swap! info str %)
                 run-cmd (fn [sub-cmd]
                           (clear-info)
                           (set-visibility true)
                           (run-kiidrv zadic-path sub-cmd append-info))]
      (fn []
        (if (nil? zadic-path)
          [:h2 "kiidrv utility not installed."]
          [:div
           [:div {:style {:display         "flex"
                          :justify-content "space-between"
                          :align-items     "center"}}
            [:h3 "Driver Diagnostics"]
            [:div
             {:style {:display "flex"
                      :justify-content "space-between"
                      :align-items "center"}
              }
             [run-verify-button #(run-cmd "verify")]
             [run-fix-button #(run-cmd "fixup")]
             ]
           ]
           (when @visible?
             [:div {:style {:display "inline-block"}}
              [mui/text-field
               {:value @info
                :floating-label-fixed true
                :floating-label-text  "command results"
                :read-only            true
                :multi-line           true
                :rows                 25
                :rowsMax              25
                :style                {:display     "block"
                                       :width       "900px"
                                       :font-family styling/monospace-font-stack}
                :textarea-style       {:white-space    "pre"
                                       :padding-bottom "1.2em"
                                       :color          "black"
                                       :font-size      "0.9em"}
                :floating-label-style {:font-size "24px"}

                }]
              ])
           ]
          )
        )
      )
    )
  )
