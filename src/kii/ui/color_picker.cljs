(ns kii.ui.color-picker
  (:require [reagent.core :as r]
            [reagent.impl.template]
            [reagent.interop :refer-macros [$ $!]]))

;; This is an ugly nasty hack and should be removed when i have time
;;  to debug why the cljsjs.react-color package fails to load properly
;; Currently cljsjsj.color-picker fails to be able to require `tinycolor`
;;  The work around is to include `color-picker` in the `npm-deps` section
(def react-color (js/require "react-color"))
;;(def react-color js/ReactColor)

(def alpha (r/adapt-react-class (aget react-color "AlphaPicker")))
(def block (r/adapt-react-class (aget react-color "BlockPicker")))
(def chrome (r/adapt-react-class (aget react-color "ChromePicker")))
(def circle (r/adapt-react-class (aget react-color "CirclePicker")))
(def compact (r/adapt-react-class (aget react-color "CompactPicker")))
(def custom (r/adapt-react-class (aget react-color "CustomPicker")))
(def github (r/adapt-react-class (aget react-color "GithubPicker")))
(def hue (r/adapt-react-class (aget react-color "HuePicker")))
(def material (r/adapt-react-class (aget react-color "MaterialPicker")))
(def photoshop (r/adapt-react-class (aget react-color "PhotoshopPicker")))
(def sketch (r/adapt-react-class (aget react-color "SketchPicker")))
(def slider (r/adapt-react-class (aget react-color "SliderPicker")))
(def swatches (r/adapt-react-class (aget react-color "SwatchesPicker")))
(def twitter (r/adapt-react-class (aget react-color "TwitterPicker")))
