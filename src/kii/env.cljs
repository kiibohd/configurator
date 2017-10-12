(ns kii.env)

(declare dev?)

(goog-define dev? false)

(def base-uri
  (if dev?
    "http://localhost:8080/"
    "https://configurator.input.club/enki/"))
