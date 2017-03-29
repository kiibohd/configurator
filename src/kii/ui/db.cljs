(ns kii.ui.db
  (:require [kii.env :as env]))

(def default-db
  {:devices         nil
   :active-filter   :ic-only
   :selected-device nil
   :active-panel    :home
   :cfg             {}})

