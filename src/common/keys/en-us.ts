import _ from 'lodash';
import { LocalizedKey, Locale } from './types';

function buildCode2iec(): SparseArray<string> {
  const mapping: Pair<number, string>[] = [
    [8, 'iec/e13'], // Backspace
    [9, 'iec/d00'], // Tab
    [13, 'iec/c12'], // Enter
    [16, 'iec/b99'], // Shift
    [17, 'iec/a99'], // Control
    [18, 'iec/a02'], // Alt
    [19, 'iec/f32'], // Pause
    [20, 'iec/c99'], // CAPSLOCK
    [27, 'iec/f00'], // ESCAPE
    [32, 'iec/a03'], // SPACE
    [33, 'iec/e32'], // PAGEUP
    [34, 'iec/d32'], // PAGEDOWN
    [35, 'iec/d31'], // END
    [36, 'iec/e31'], // HOME
    [37, 'iec/a30'], // LEFT
    [38, 'iec/b31'], // UP
    [39, 'iec/a32'], // RIGHT
    [40, 'iec/a31'], // DOWN
    [44, 'iec/f30'], // PRINTSCREEN
    [45, 'iec/e30'], // INSERT
    [46, 'iec/d30'], // DELETE
    [48, 'iec/e10'], // 0
    [49, 'iec/e01'], // 1
    [50, 'iec/e02'], // 2
    [51, 'iec/e03'], // 3
    [52, 'iec/e04'], // 4
    [53, 'iec/e05'], // 5
    [54, 'iec/e06'], // 6
    [55, 'iec/e07'], // 7
    [56, 'iec/e08'], // 8
    [57, 'iec/e09'], // 9
    [59, 'iec/c10'], // SEMICOLON
    [61, 'iec/e12'], // EQUALS
    [65, 'iec/c01'], // A
    [66, 'iec/b05'], // B
    [67, 'iec/b03'], // C
    [68, 'iec/c03'], // D
    [69, 'iec/d03'], // E
    [70, 'iec/c04'], // F
    [71, 'iec/c05'], // G
    [72, 'iec/c06'], // H
    [73, 'iec/d08'], // I
    [74, 'iec/c07'], // J
    [75, 'iec/c08'], // K
    [76, 'iec/c09'], // L
    [77, 'iec/b07'], // M
    [78, 'iec/b06'], // N
    [79, 'iec/d09'], // O
    [80, 'iec/d10'], // P
    [81, 'iec/d01'], // Q
    [82, 'iec/d04'], // R
    [83, 'iec/c02'], // S
    [84, 'iec/d05'], // T
    [85, 'iec/d07'], // U
    [86, 'iec/b04'], // V
    [87, 'iec/d02'], // W
    [88, 'iec/b02'], // X
    [89, 'iec/d06'], // Y
    [90, 'iec/b01'], // Z
    [91, 'iec/a00'], // LGUI
    [92, 'iec/a10'], // RGUI
    [93, 'iec/a11'], // SELECT / Menu
    [96, 'iec/a51'], // NUMPAD 0
    [97, 'iec/b51'], // NUMPAD 1
    [98, 'iec/b52'], // NUMPAD 2
    [99, 'iec/b53'], // NUMPAD 3
    [100, 'iec/c51'], // NUMPAD 4
    [101, 'iec/c52'], // NUMPAD 5
    [102, 'iec/c53'], // NUMPAD 6
    [103, 'iec/d51'], // NUMPAD 7
    [104, 'iec/d52'], // NUMPAD 8
    [105, 'iec/d53'], // NUMPAD 9
    [106, 'iec/e53'], // MULTIPLY
    [107, 'iec/d54'], // ADD
    [109, 'iec/e54'], // SUBTRACT
    [110, 'iec/a53'], // DECIMALSEP
    [111, 'iec/e52'], // DIVIDE
    [112, 'iec/f01'], // F1
    [113, 'iec/f02'], // F2
    [114, 'iec/f03'], // F3
    [115, 'iec/f04'], // F4
    [116, 'iec/f05'], // F5
    [117, 'iec/f06'], // F6
    [118, 'iec/f07'], // F7
    [119, 'iec/f08'], // F8
    [120, 'iec/f09'], // F9
    [121, 'iec/f10'], // F10
    [122, 'iec/f11'], // F11
    [123, 'iec/f12'], // F12
    [144, 'iec/e51'], // NUMLOCK
    [145, 'iec/f31'], // SCROLLLOCK
    [173, 'iec/e11'], // MINUS (firefox only?)
    [186, 'iec/c10'], // SEMICOLON
    [187, 'iec/e12'], // EQUAL
    [188, 'iec/b08'], // COMMA
    [189, 'iec/e11'], // MINUS
    [190, 'iec/b09'], // PERIOD
    [191, 'iec/b10'], // SLASH
    [192, 'iec/e00'], // BACKTICK
    [219, 'iec/d11'], // LBRACE
    [220, 'iec/d13'], // BACKSLASH
    [221, 'iec/d12'], // RBRACE
    [222, 'iec/c11'], // QUOTE

    // Left-Side Keys
    [1016, 'iec/b99'], // LSHIFT
    [1017, 'iec/a99'], // LCTRL
    [1018, 'iec/a00'], // LALT
    [1091, 'iec/a01'], // LGUI

    // Right-Side Keys
    [2016, 'iec/b11'], // RSHIFT
    [2017, 'iec/a12'], // RCTRL
    [2018, 'iec/a08'], // RALT
    [2091, 'iec/a10'], // RGUI
    [2092, 'iec/a10'], // RGUI
    [2093, 'iec/a10'] // RGUI (⌘)

    // Numpad Keys

    // Need ISO/ & ISO#
  ];

  return mapping.reduce((arr: SparseArray<string>, [code, loc]) => {
    arr[code] = loc;
    return arr;
  }, []);
}

function buildKeys(): LocalizedKey[] {
  const keys = [
    ['iec/f00', 'key/esc'],
    ['iec/f01', 'key/f1'],
    ['iec/f02', 'key/f2'],
    ['iec/f03', 'key/f3'],
    ['iec/f04', 'key/f4'],
    ['iec/f05', 'key/f5'],
    ['iec/f06', 'key/f6'],
    ['iec/f07', 'key/f7'],
    ['iec/f08', 'key/f8'],
    ['iec/f09', 'key/f9'],
    ['iec/f10', 'key/f10'],
    ['iec/f11', 'key/f11'],
    ['iec/f12', 'key/f12'],
    ['iec/e00', 'key/btick', '`', '~'],
    ['iec/e01', 'key/1', '1', '!'],
    ['iec/e02', 'key/2', '2', '@'],
    ['iec/e03', 'key/3', '3', '#'],
    ['iec/e04', 'key/4', '4', '$'],
    ['iec/e05', 'key/5', '5', '%'],
    ['iec/e06', 'key/6', '6', '^'],
    ['iec/e07', 'key/7', '7', '&'],
    ['iec/e08', 'key/8', '8', '*'],
    ['iec/e09', 'key/9', '9', '('],
    ['iec/e10', 'key/0', '0', ')'],
    ['iec/e11', 'key/-', '-', '_'],
    ['iec/e12', 'key/=', '=', '+'],
    ['iec/e13', 'key/backsp'],
    ['iec/d00', 'key/tab'],
    ['iec/d01', 'key/q'],
    ['iec/d02', 'key/w'],
    ['iec/d03', 'key/e'],
    ['iec/d04', 'key/r'],
    ['iec/d05', 'key/t'],
    ['iec/d06', 'key/y'],
    ['iec/d07', 'key/u'],
    ['iec/d08', 'key/i'],
    ['iec/d09', 'key/o'],
    ['iec/d10', 'key/p'],
    ['iec/d11', 'key/lbr', '[', '{'],
    ['iec/d12', 'key/rbr', ']', '}'],
    ['iec/d13', 'key/bslash', '\\', '|'],
    ['iec/c99', 'key/caps'],
    ['iec/c01', 'key/a'],
    ['iec/c02', 'key/s'],
    ['iec/c03', 'key/d'],
    ['iec/c04', 'key/f'],
    ['iec/c05', 'key/g'],
    ['iec/c06', 'key/h'],
    ['iec/c07', 'key/j'],
    ['iec/c08', 'key/k'],
    ['iec/c09', 'key/l'],
    ['iec/c10', 'key/semi', ';', ':'],
    ['iec/c11', 'key/quote', "'", '"'],
    ['iec/c12', 'key/enter'],
    ['iec/b99', 'key/lshift'],
    ['iec/b01', 'key/z'],
    ['iec/b02', 'key/x'],
    ['iec/b03', 'key/c'],
    ['iec/b04', 'key/v'],
    ['iec/b05', 'key/b'],
    ['iec/b06', 'key/n'],
    ['iec/b07', 'key/m'],
    ['iec/b08', 'key/comma', ',', '<'],
    ['iec/b09', 'key/.', '.', '>'],
    ['iec/b10', 'key/slash', '/', '?'],
    ['iec/b11', 'key/rshift'],
    ['iec/a99', 'key/lctrl'],
    ['iec/a01', 'key/lgui'],
    ['iec/a02', 'key/lalt'],
    ['iec/a03', 'key/space'],
    ['iec/a08', 'key/ralt'],
    ['iec/a10', 'key/rgui'],
    ['iec/a11', 'key/menu'],
    ['iec/a12', 'key/rctrl'],

    ['iec/f30', 'key/prsc'],
    ['iec/f31', 'key/sclk'],
    ['iec/f32', 'key/pause'],
    ['iec/e30', 'key/ins'],
    ['iec/e31', 'key/home'],
    ['iec/e32', 'key/pgup'],
    ['iec/d30', 'key/del'],
    ['iec/d31', 'key/end'],
    ['iec/d32', 'key/pgdn'],
    ['iec/b31', 'key/up'],
    ['iec/a30', 'key/left'],
    ['iec/a31', 'key/down'],
    ['iec/a32', 'key/right'],

    ['iec/e51', 'key/nmlk'],
    ['iec/e52', 'key/pdiv'],
    ['iec/e53', 'key/p*'],
    ['iec/e54', 'key/p-'],
    ['iec/d51', 'key/p7'],
    ['iec/d52', 'key/p8'],
    ['iec/d53', 'key/p9'],
    ['iec/d54', 'key/p+'],
    ['iec/c51', 'key/p4'],
    ['iec/c52', 'key/p5'],
    ['iec/c53', 'key/p6'],
    ['iec/b51', 'key/p1'],
    ['iec/b52', 'key/p2'],
    ['iec/b53', 'key/p3'],
    ['iec/b54', 'key/pent'],
    ['iec/a51', 'key/p0'],
    ['iec/a53', 'key/p.']
  ];

  return keys.map(([iec, key, label1, label2, label3]) => ({
    iec,
    key,
    label1,
    label2,
    label3
  }));
}

const keys = buildKeys();

const locale: Locale = {
  keys,
  // TODO: Change to code2key
  code2iec: buildCode2iec(),
  iec2key: _.keyBy(keys, 'iec'),
  keyname2key: _.keyBy(keys, 'key')
};

export default locale;
