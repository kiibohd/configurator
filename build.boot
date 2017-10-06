(require '[boot.core :refer :all]                           ; IntelliJ "integration"
         '[boot.task.built-in :refer :all])

(task-options!
  pom {:project     'configurator
       :version     "0.1"
       :description "Input:Club Configuration Utility"
       :license     {"GPLv3" "https://www.gnu.org/licenses/gpl-3.0.en.html"}})

(task-options! repl {:port 9009})

(set-env!
  :dependencies
  '[[org.clojure/clojure "1.9.0-beta1" :scope "provided"]
    [org.clojure/clojurescript "1.9.946" :scope "compile"]
    ;; Boot Deps
    [boot/core "2.7.2" :scope "provided"]
    [onetom/boot-lein-generate "0.1.3" :scope "test"]
    [org.clojure/tools.nrepl "0.2.12" :scope "test"]
    [com.cemerick/piggieback "0.2.1" :scope "test"]
    [weasel "0.7.0" :scope "test"]
    [adzerk/boot-cljs "2.1.3" :scope "test"]
    [adzerk/boot-cljs-repl "0.4.0-SNAPSHOT" :scope "test"]
    [adzerk/boot-reload "0.5.2" :scope "test"]
    ;; Dev tools enhancements
    [binaryage/devtools "0.9.4" :scope "test"]
    [binaryage/dirac "1.2.10" :scope "test"]
    [powerlaces/boot-cljs-devtools "0.2.0" :scope "test"]
    ;; Project Dependencies
    [reagent "0.7.0" :exclusions [org.clojure/tools.reader cljsjs/react]]
    [re-frame "0.10.1"]
    [day8.re-frame/undo "0.3.2"]
    [cljsjs/react-with-addons "15.6.1-0"]
    [cljs-react-material-ui "0.2.45"]
    [cljs-css-modules "0.2.1"]
    [cljs-ajax "0.5.8"]
    [camel-snake-kebab "0.4.0"]
    ]
  :source-paths #{"src"}
  ;;:asset-paths #{"assets"}
  :resource-paths #{"resources"})

;; Allows for Cursive integration.
(require '[boot.lein])
(boot.lein/generate)

(require
  '[adzerk.boot-cljs :refer [cljs]]
  '[adzerk.boot-cljs-repl :refer [cljs-repl start-repl]]
  '[adzerk.boot-reload :refer [reload]]
  '[powerlaces.boot-cljs-devtools :refer [cljs-devtools dirac]])

(deftask prod-build []
         (comp (cljs :ids #{"main"}
                     :optimizations :simple)
               (cljs :ids #{"renderer"}
                     :optimizations :advanced
                     :compiler-options {:load-tests false})))

(def devtools-config
  {:features-to-install [:formatters :hints :async]
   :dont-detect-custom-formatters true})

(deftask dev-build []
         (comp                                              
           ;; Audio feedback about warnings etc. =======================
           ;;(speak)
           ;; Inject REPL and reloading code into renderer build =======
           ;;(add-source-paths :dirs #{"test/app"})
           (cljs-repl :ids #{"renderer"})
           (reload :ids #{"renderer"}
                   :ws-host "localhost"
                   :on-jsload 'kii.ui.core/init
                   :target-path "target")
           ;; Dev Tools =============
           ;;(dirac)
           (cljs-devtools)
           ;; Compile renderer =========================================
           (cljs :ids #{"renderer"}
                 :compiler-options {:closure-defines {'kii.env/dev? true}
                                    :parallel-build  true
                                    :external-config {:devtools/config devtools-config}})
           ;; Compile JS for main process ==============================
           ;; path.resolve(".") which is used in CLJS's node shim
           ;; returns the directory `electron` was invoked in and
           ;; not the directory our main.js file is in.
           ;; Because of this we need to override the compilers `:asset-path option`
           ;; See http://dev.clojure.org/jira/browse/CLJS-1444 for details.
           (cljs :ids #{"main"}
                 :compiler-options {:asset-path      "target/main.out"
                                    :closure-defines {'kii.env/dev? true}})
           (target)))