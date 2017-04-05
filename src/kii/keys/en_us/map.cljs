(ns kii.keys.en-us.map
  (:refer-clojure :exclude [keys]))

;; TODO: Remove once en-us hardcode is gone.
(defn ->iec-map
  [code key l1 l2 l3]
  {:iec code
   :key key
   :label1 l1
   :label2 l2
   :label3 l3})

(def code->iec9995
  {8    :e13                                                ;; Backspace
   9    :d00                                                ;; Tab
   13   :c12                                                ;; Enter
   16   :b99                                                ;; Shift
   17   :a99                                                ;; Control
   18   :a02                                                ;; Alt
   19   :f32                                                ;; Pause
   20   :c99                                                ;; CAPSLOCK
   27   :f00                                                ;; ESCAPE
   32   :a03                                                ;; SPACE
   33   :e32                                                ;; PAGEUP
   34   :d32                                                ;; PAGEDOWN
   35   :d31                                                ;; END
   36   :e31                                                ;; HOME
   37   :a30                                                ;; LEFT
   38   :b31                                                ;; UP
   39   :a32                                                ;; RIGHT
   40   :a31                                                ;; DOWN
   44   :f30                                                ;; PRINTSCREEN
   45   :e30                                                ;; INSERT
   46   :d30                                                ;; DELETE
   48   :e10                                                ;; 0
   49   :e01                                                ;; 1
   50   :e02                                                ;; 2
   51   :e03                                                ;; 3
   52   :e04                                                ;; 4
   53   :e05                                                ;; 5
   54   :e06                                                ;; 6
   55   :e07                                                ;; 7
   56   :e08                                                ;; 8
   57   :e09                                                ;; 9
   59   :c10                                                ;; SEMICOLON
   61   :e12                                                ;; EQUALS
   65   :c01                                                ;; A
   66   :b05                                                ;; B
   67   :b03                                                ;; C
   68   :c03                                                ;; D
   69   :d03                                                ;; E
   70   :c04                                                ;; F
   71   :c05                                                ;; G
   72   :c06                                                ;; H
   73   :d08                                                ;; I
   74   :c07                                                ;; J
   75   :c08                                                ;; K
   76   :c09                                                ;; L
   77   :b07                                                ;; M
   78   :b06                                                ;; N
   79   :d09                                                ;; O
   80   :d10                                                ;; P
   81   :d01                                                ;; Q
   82   :d04                                                ;; R
   83   :c02                                                ;; S
   84   :d05                                                ;; T
   85   :d07                                                ;; U
   86   :b04                                                ;; V
   87   :d02                                                ;; W
   88   :b02                                                ;; X
   89   :d06                                                ;; Y
   90   :b01                                                ;; Z
   91   :a00                                                ;; LGUI
   92   :a10                                                ;; RGUI
   93   :a11                                                ;; SELECT / Menu
   96   :a51                                                ;; NUMPAD 0
   97   :b51                                                ;; NUMPAD 1
   98   :b52                                                ;; NUMPAD 2
   99   :b53                                                ;; NUMPAD 3
   100  :c51                                                ;; NUMPAD 4
   101  :c52                                                ;; NUMPAD 5
   102  :c53                                                ;; NUMPAD 6
   103  :d51                                                ;; NUMPAD 7
   104  :d52                                                ;; NUMPAD 8
   105  :d53                                                ;; NUMPAD 9
   106  :e53                                                ;; MULTIPLY
   107  :d54                                                ;; ADD
   109  :e54                                                ;; SUBTRACT
   110  :a53                                                ;; DECIMALSEP
   111  :e52                                                ;; DIVIDE
   112  :f01                                                ;; F1
   113  :f02                                                ;; F2
   114  :f03                                                ;; F3
   115  :f04                                                ;; F4
   116  :f05                                                ;; F5
   117  :f06                                                ;; F6
   118  :f07                                                ;; F7
   119  :f08                                                ;; F8
   120  :f09                                                ;; F9
   121  :f10                                                ;; F10
   122  :f11                                                ;; F11
   123  :f12                                                ;; F12
   144  :e51                                                ;; NUMLOCK
   145  :f31                                                ;; SCROLLLOCK
   173  :e11                                                ;; MINUS (firefox only?)
   186  :c10                                                ;; SEMICOLON
   187  :e12                                                ;; EQUAL
   188  :b08                                                ;; COMMA
   189  :e11                                                ;; MINUS
   190  :b09                                                ;; PERIOD
   191  :b10                                                ;; SLASH
   192  :e00                                                ;; BACKTICK
   219  :d11                                                ;; LBRACE
   220  :d13                                                ;; BACKSLASH
   221  :d12                                                ;; RBRACE
   222  :c11                                                ;; QUOTE

   ;; Left-Side Keys
   1016 :b99                                                ;; LSHIFT
   1017 :a99                                                ;; LCTRL
   1018 :a00                                                ;; LALT
   1091 :a01                                                ;; LGUI

   ;; Right-Side Keys
   2016 :b11                                                ;; RSHIFT
   2017 :a12                                                ;; RCTRL
   2018 :a08                                                ;; RALT
   2091 :a10                                                ;; RGUI
   2092 :a10                                                ;; RGUI
   2093 :a10                                                ;; RGUI (⌘)

   ;; Numpad Keys

   ;; Need ISO/ & ISO#

   })

(def keys
  [[:f00 :esc]
   [:f01 :f1]
   [:f02 :f2]
   [:f03 :f3]
   [:f04 :f4]
   [:f05 :f5]
   [:f06 :f6]
   [:f07 :f7]
   [:f08 :f8]
   [:f09 :f9]
   [:f10 :f10]
   [:f11 :f11]
   [:f12 :f12]
   [:e00 :btick "`" "~"]
   [:e01 :1 "1" "!"]
   [:e02 :2 "2" "@"]
   [:e03 :3 "3" "#"]
   [:e04 :4 "4" "$"]
   [:e05 :5 "5" "%"]
   [:e06 :6 "6" "^"]
   [:e07 :7 "7" "&"]
   [:e08 :8 "8" "*"]
   [:e09 :9 "9" "("]
   [:e10 :0 "0" ")"]
   [:e11 :- "-" "_"]
   [:e12 := "=" "+"]
   [:e13 :backsp]
   [:d00 :tab]
   [:d01 :q]
   [:d02 :w]
   [:d03 :e]
   [:d04 :r]
   [:d05 :t]
   [:d06 :y]
   [:d07 :u]
   [:d08 :i]
   [:d09 :o]
   [:d10 :p]
   [:d11 :lbr "[" "{"]
   [:d12 :rbr "]" "}"]
   [:d13 :bslash "\\" "|"]
   [:c99 :caps]
   [:c01 :a]
   [:c02 :s]
   [:c03 :d]
   [:c04 :f]
   [:c05 :g]
   [:c06 :h]
   [:c07 :j]
   [:c08 :k]
   [:c09 :l]
   [:c10 :semi ";" ":"]
   [:c11 :quote "'" "\""]
   [:c12 :enter]
   [:b99 :rshift]
   [:b01 :z]
   [:b02 :x]
   [:b03 :c]
   [:b04 :v]
   [:b05 :b]
   [:b06 :n]
   [:b07 :m]
   [:b08 :comma "," "<"]
   [:b09 :. "." ">"]
   [:b10 :slash "/" "?"]
   [:b11 :rshift]
   [:a99 :lctrl]
   [:a01 :lgui]
   [:a02 :lalt]
   [:a03 :space]
   [:a08 :ralt]
   [:a10 :rgui]
   [:a11 :menu]
   [:a12 :rctrl]

   [:f30 :prsc]
   [:f31 :sclk]
   [:f32 :pause]
   [:e30 :ins]
   [:e31 :home]
   [:e32 :pgup]
   [:d30 :del]
   [:d31 :end]
   [:d32 :pgdn]
   [:b31 :up]
   [:a30 :left]
   [:a31 :down]
   [:a32 :right]

   [:e51 :nmlk]
   [:e52 :pdiv]
   [:e53 :p*]
   [:e54 :p-]
   [:d51 :p7]
   [:d52 :p8]
   [:d53 :p9]
   [:d54 :p+]
   [:c51 :p4]
   [:c52 :p5]
   [:c53 :p6]
   [:b51 :p1]
   [:b52 :p2]
   [:b53 :p3]
   [:b54 :pent]
   [:a51 :p0]
   [:a53 :p.]
   ])

(def iec9995->key
  (into
    {}
    (map
      (juxt first #(apply ->iec-map %))
      keys
      ))
  )

(def key->iec9995
  (into
    {}
    (map
      (juxt second #(apply ->iec-map %))
      keys)))


(def locale
  {:keys      keys
   :iec->key  iec9995->key
   :key->iec  key->iec9995
   :code->iec code->iec9995})