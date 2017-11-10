(ns kii.main.menu
  (:require [kii.env :as env]
            [kii.bindings.electron-main :as electron]))

(defn- open-website
  [url]
  (.openExternal electron/shell url))

(defn- build-template
  []
  {:about    {:label   (.getName (.-app electron/electron))
              :submenu [{:role "about"}
                        {:type "separator"}
                        {:role "services" :submenu []}
                        {:type "separator"}
                        {:role "hide"}
                        {:role "hideothers"}
                        {:role "unhide"}
                        {:type "separator"}
                        {:role "quit"}]}
   :file     {:label   "File"
              :submenu [{:role "quit"}]}
   :edit     {:label   "Edit"
              :submenu [{:role "undo"}
                        {:role "redo"}
                        {:type "separator"}
                        {:role "cut"}
                        {:role "copy"}
                        {:role "paste"}
                        {:role "pasteandmatchstyle"}
                        {:role "delete"}
                        {:role "selectall"}]}
   :edit/dar {:label   "Edit"
              :submenu [{:role "undo"}
                        {:role "redo"}
                        {:type "separator"}
                        {:role "cut"}
                        {:role "copy"}
                        {:role "paste"}
                        {:role "pasteandmatchstyle"}
                        {:role "delete"}
                        {:role "selectall"}
                        {:type "separator"}
                        {:label   "Speech"
                         :submenu [{:role "startspeaking"}
                                   {:role "stopspeaking"}]}
                        ]}
   :view/dev {:label   "View"
              :submenu [{:role "reload"}
                        {:role "toggledevtools"}
                        {:type "separator"}
                        {:role "resetzoom"}
                        {:role "zoomin"}
                        {:role "zoomout"}
                        {:type "separator"}
                        {:role "togglefullscreen"}]}
   :view/rel {:label   "View"
              :submenu [{:role "resetzoom"}
                        {:role "zoomin"}
                        {:role "zoomout"}
                        {:type "separator"}
                        {:role "togglefullscreen"}]}
   :win      {:role    "window"
              :submenu [{:role "minimize"}
                        {:role "close"}]}
   :win/dar  {:role    "window"
              :submenu [{:role "close"}
                        {:role "minimize"}
                        {:role "zoom"}
                        {:type "separator"}
                        {:role "front"}]}
   :help     {:role    "help"
              :submenu [{:role "about"}
                        {:label "Learn More" :click #(open-website "https://github.com/kiibohd/configurator")}
                        {:label "Documentation" :click #(open-website "https://github.com/kiibohd/configurator#readme")}
                        {:label "Community Discussions" :click #(open-website "https://input.club/forums/forum/support/configurator/")}
                        {:label "Search Issues" :click #(open-website "https://github.com/kiibohd/configurator/issues")}]
              }}
  )


(defn build-menu
  [window]
  (let [view-key :view/dev #_(if env/dev? :view/dev :view/rel)
        menu-keys (if (= "darwin" js/process.platform)
                   [:about :edit/dar view-key :win/dar :help]
                   [:file :edit view-key :win :help])
        template (-> (build-template)
                     (select-keys menu-keys)
                     vals
                     vec
                     clj->js)
        elec-menu (.-Menu electron/electron)
        menu (.buildFromTemplate elec-menu template)]
    (.setApplicationMenu elec-menu menu)
    menu))