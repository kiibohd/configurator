(ns kii.macros)

(defmacro <?
  [ch]
  `(let [~'res (~'<! ~ch)]
     (when (instance? js/Error ~'res)
       (throw ~'res))
     ~'res))

(defmacro go-try
  [& body]
  `(~'go
     (try
       ~@body
       (catch js/Error e# e#))))

(defmacro cb->chan*
  [form cb]
  `(let [~'c (~'chan)]
     (~@form ~cb)
     ~'c))

(defmacro cb->chan
  "Convert a promise into a core.async channel, dump the results to the channel."
  ([form]
    (let [cb `(fn [~'e ~'data]
                (cond
                  (some? ~'e) (~'put! ~'c ~'e)
                  (some? ~'data) (~'put! ~'c ~'data))
                (~'close! ~'c))]
      `(cb->chan* ~form ~cb)))
  ([form transform]
    (let [cb `(fn [~'e ~'data]
                (cond
                  (some? ~'e) (~'put! ~'c ~'e)
                  (some? ~'data) (~'put! ~'c (~transform ~'data)))
                (~'close! ~'c))]
      `(cb->chan* ~form ~cb)))
  )

(defmacro p->chan*
  [form on-fulfilled on-rejected]
  `(let [~'c (~'chan)
         ~'p (~@form)]
     (.then ~'p ~on-fulfilled)
     (.catch ~'p ~on-rejected)
     ~'c)
  )

(defmacro p->chan
  "Convert a promise into a core.async channel, dump the results to the channel."
  ([form]
   (let [cb `(fn [~'data]
               (when (some? ~'data) (~'put! ~'c ~'data))
               (~'close! ~'c))
         err `(fn [~'e]
                (when (some? ~'e) (~'put! ~'c ~'e))
                (~'close! ~'c))]
     `(p->chan* ~form ~cb ~err))
    )
  ([form transform]
   (let [cb `(fn [~'data]
               (when (some? ~'data) (~'put! ~'c (~transform ~'data)))
               (~'close! ~'c))
         err `(fn [~'e]
                (when (some? ~'e) (~'put! ~'c ~'e))
                (~'close! ~'c))]
     `(p->chan* ~form ~cb ~err))
    )
  )


(defmacro go-let
  [bindings & body]
  `(~'go (let ~bindings ~@body)))