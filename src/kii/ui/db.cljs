(ns kii.ui.db
  (:require [kii.env :as env]))

(def default-db
  {:devices         nil
   :active-filter   :ic-only
   :active-keyboard nil
   :active-panel    :home
   :conf            {}})

