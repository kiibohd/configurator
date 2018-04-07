(ns kii.ui.color-picker
  (:require [cljsjs.tinycolor]
            [cljsjs.react-color]
            [reagent.core :as r]))

(def react-color js/ReactColor)

(def alpha (r/adapt-react-class js/ReactColor.AlphaPicker))
(def block (r/adapt-react-class js/ReactColor.BlockPicker))
(def chrome (r/adapt-react-class js/ReactColor.ChromePicker))
(def circle (r/adapt-react-class js/ReactColor.CirclePicker))
(def compact (r/adapt-react-class js/ReactColor.CompactPicker))
(def github (r/adapt-react-class js/ReactColor.GithubPicker))
(def hue (r/adapt-react-class js/ReactColor.HuePicker))
(def material (r/adapt-react-class js/ReactColor.MaterialPicker))
(def photoshop (r/adapt-react-class js/ReactColor.PhotoshopPicker))
(def sketch (r/adapt-react-class js/ReactColor.SketchPicker))
(def slider (r/adapt-react-class js/ReactColor.SliderPicker))
(def swatches (r/adapt-react-class js/ReactColor.SwatchesPicker))
(def twitter (r/adapt-react-class js/ReactColor.TwitterPicker))
(def custom (r/adapt-react-class js/ReactColor.CustomPicker))