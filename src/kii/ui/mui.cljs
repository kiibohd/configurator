(ns kii.ui.mui
  (:require [reagent.core :as r]
            [taoensso.timbre :as timbre :refer-macros [log logf]]
            [cljs-react-material-ui.reagent :as mui]
  ))

(defn text-field
  "TextField without cursor jumps in text/textarea elements. Problem explained:
https://stackoverflow.com/questions/28922275/in-reactjs-why-does-setstate-behave-differently-when-called-synchronously/28922465#28922465
I haven't tested it much in IE yet, so if it breaks in IE see this: https://github.com/tonsky/rum/issues/86
Usage example:
[text-field {:value      @ui-value
             :on-change  (fn [e val] ...)}]"
  [{:keys [value on-change] :as _props}]
  {:pre [(ifn? on-change)]}
  (let [local-value (atom value)]                           ; regular atom is used instead of React's state to better control when renders should be triggered
    (r/create-class
      {:display-name            "MuiTextFieldFixed"

       :should-component-update (fn [_ [_ old-props] [_ new-props]]
                                  ; Update only if value is different from the rendered one or...
                                  (if (not= (:value new-props) @local-value)
                                    (do
                                      (reset! local-value (:value new-props))
                                      true)

                                    ; other props changed
                                    (not= (dissoc new-props :value)
                                          (dissoc old-props :value))))

       :render                  (fn [this]
                                  [mui/text-field (-> (r/props this)
                                                      ; use value only from the local atom
                                                      (assoc :value @local-value)
                                                      (update :on-change
                                                              (fn wrap-on-change [original-on-change]
                                                                (fn wrapped-on-change [e val]
                                                                  ; render immediately to sync DOM and virtual DOM
                                                                  (reset! local-value val)
                                                                  (r/force-update this)

                                                                  ; this will presumably update the value in global state atom
                                                                  (original-on-change e val)))))])}))
  )
