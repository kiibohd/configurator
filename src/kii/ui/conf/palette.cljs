(ns kii.ui.conf.palette)

;; TODO: Move up to kii.ui.color
(def palette
  {:navy    "#001f3f"
   :blue    "#0074D9"
   :aqua    "#7FDBFF"
   :teal    "#39CCCC"
   :olive   "#3D9970"
   :green   "#2ECC40"
   :lime    "#01FF70"
   :yellow  "#FFDC00"
   :orange  "#FF851B"
   :red     "#FF4136"
   :maroon  "#85144B"
   :fuchsia "#F012BE"
   :purple  "#B10DC9"
   :black   "#111111"
   :gray    "#AAAAAA"
   :silver  "#DDDDDD"
   :darkgray "#444444"
   :lightgray "#fcfcfc"
   :lightpurple "#a18fff"})

(def layer-bg
  [:silver :blue :green :orange
   :purple :teal :fuchsia :red])

(def layer-fg
  ;; Change only the foreground color.
  (assoc layer-bg 0 :black))

(defn get-layer-bg
  [idx]
  (let [color (get layer-bg idx)]
    (-> palette color)))

(defn get-layer-fg
  [idx]
  (let [color (get layer-fg idx)]
    (-> palette color)))
