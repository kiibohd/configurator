(ns kii.ui.db
  (:require [kii.env :as env]))

;; TODO: This needs a schema!!!
(def default-db
  {:devices         nil
   :active-filter   :ic-only
   :active-keyboard nil
   :active-panel    :keyboard-select
   :conf            {}})

