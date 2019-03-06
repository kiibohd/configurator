import { freeze as freezeMap } from '../utils/map';

/**
 * @returns {import('./types').Keyboard[]}
 */
function buildKeyboardList() {
  const layouts = (...layouts) => {
    return layouts.reduce((o, [v, ls]) => {
      o[v] = ls;
      return o;
    }, {});
  };

  return [
    {
      display: names.InfinityErgodox,
      names: ['MDErgo1', 'Infinity_Ergodox'],
      variants: [variants.Default],
      visuals: false,
      layouts: layouts([variants.Default, ['Default', 'Blank']]),
      info: {}
    },
    {
      display: names.Infinity60Led,
      names: ['MD1.1', 'Infinity_60%_LED', 'Infinity_60_LED'],
      variants: [variants.Standard, variants.Hacker, variants.Alphabet],
      visuals: false,
      layouts: layouts(
        [variants.Standard, ['Standard', 'StandardBlank']],
        [variants.Hacker, ['Hacker', 'HackerBlank']],
        [variants.Alphabet, ['Alphabet', 'AlphabetBlank']]
      ),
      info: {}
    },
    {
      display: names.Infinity60,
      names: ['MD1', 'Infinity_60%', 'Infinity_60'],
      variants: [variants.Standard, variants.Hacker],
      visuals: false,
      layouts: layouts(
        [variants.Standard, ['Standard', 'StandardBlank']],
        [variants.Hacker, ['Hacker', 'HackerBlank']]
      ),
      info: {}
    },
    {
      display: names.WhiteFox,
      names: ['WhiteFox'],
      variants: [
        variants.TrueFox,
        variants.Aria,
        variants.Iso,
        variants.Vanilla,
        variants.JackOfAllTrades,
        variants.Wkl
      ],
      visuals: false,
      layouts: layouts(
        [variants.TrueFox, ['TheTrueFox']],
        [variants.Aria, ['Aria']],
        [variants.Iso, ['Iso']],
        [variants.Vanilla, ['Vanilla']],
        [variants.JackOfAllTrades, ['JackofAllTrades']],
        [variants.Wkl, ['Winkeyless']]
      ),
      info: {}
    },
    {
      display: names.KType,
      names: ['KType', 'K-Type'],
      variants: [variants.Standard],
      visuals: true,
      layouts: layouts([variants.Standard, ['Standard', 'NoAnimations']]),
      info: {}
    },
    {
      display: names.Kira,
      names: ['Kira'],
      variants: [variants.Standard],
      visuals: true,
      layouts: layouts([variants.Standard, ['Standard']]),
      info: {
        resetCombo: '"Right Ctrl + Right Shift + Esc"'
      }
    }
  ];
}

/**
 * @returns {Map<Number, Map<Number, import('./types').KnownDevice>>}
 */
function buildDeviceList() {
  const list = [
    // Un-official original I:C vid/pid combo
    [
      0x1c11,
      [0xb04d, false, [names.InfinityErgodox, names.Infinity60, names.Infinity60Led, names.WhiteFox, names.KType]],
      [0xb007, true, [names.InfinityErgodox, names.Infinity60, names.Infinity60Led, names.WhiteFox, names.KType]]
    ],
    // Semi-official I:C shared VID
    [
      0x1209,
      [0x01c0, false, [names.InfinityErgodox, names.Infinity60, names.Infinity60Led, names.WhiteFox, names.KType]],
      [0x01cb, true, [names.InfinityErgodox, names.Infinity60, names.Infinity60Led, names.WhiteFox, names.KType]]
    ],
    // Official I:C VID with unique PIDs
    [
      0x308f,
      [0x0000, true, [names.Infinity60]],
      [0x0001, false, [names.Infinity60], variants.Standard],
      [0x0002, false, [names.Infinity60], variants.Hacker],
      [0x0003, true, [names.InfinityErgodox], variants.Default],
      [0x0004, false, [names.InfinityErgodox], variants.Default],
      [0x0005, true, [names.WhiteFox]],
      [0x0006, false, [names.WhiteFox], variants.Vanilla],
      [0x0007, false, [names.WhiteFox], variants.Iso],
      [0x0008, false, [names.WhiteFox], variants.Aria],
      [0x0009, false, [names.WhiteFox], variants.Wkl],
      [0x000a, false, [names.WhiteFox], variants.TrueFox],
      [0x000b, false, [names.WhiteFox], variants.JackOfAllTrades],
      [0x000c, true, [names.Infinity60Led]],
      [0x000d, false, [names.Infinity60Led], variants.Standard],
      [0x000e, false, [names.Infinity60Led], variants.Hacker],
      [0x000f, false, [names.Infinity60Led], variants.Alphabet],
      [0x0010, true, [names.KType], variants.Standard],
      [0x0011, false, [names.KType], variants.Standard],
      [0x0012, true, [names.Kira], variants.Standard],
      [0x0013, false, [names.Kira], variants.Standard]
    ]
  ];

  // @ts-ignore
  return freezeMap(new Map(list.map(x => devices(...x))));

  function device(vid, pid, isFlashable, names, variant) {
    return Object.freeze({
      vid,
      pid,
      isFlashable: isFlashable || false,
      isUnique: names.length === 1,
      names,
      variant
    });
  }

  function devices(vid, ...devices) {
    // @ts-ignore
    return [vid, freezeMap(new Map(devices.map(b => [b[0], device(vid, ...b)])))];
  }
}

export const names = Object.freeze({
  InfinityErgodox: 'Infinity Ergodox',
  Infinity60Led: 'Infinity 60% LED',
  Infinity60: 'Infinity 60%',
  WhiteFox: 'WhiteFox',
  KType: 'K-Type',
  Kira: 'Kira'
});

export const variants = Object.freeze({
  Default: 'Default',
  Standard: 'Standard',
  Hacker: 'Hacker',
  Alphabet: 'Alphabet',
  TrueFox: 'The True Fox',
  Aria: 'Aria',
  Vanilla: 'Vanilla',
  Iso: 'Iso',
  Wkl: 'Winkeyless',
  JackOfAllTrades: 'Jack of All Trades'
});

export const released = [
  names.WhiteFox,
  names.Kira,
  names.KType,
  names.Infinity60,
  names.Infinity60Led,
  names.InfinityErgodox
];

export const keyboards = buildKeyboardList();

export const usbDevices = buildDeviceList();

/**
 * @param {{vendorId: Number, productId: Number}} param0
 * @returns {import('./types').KnownDevice}
 */
export function getDevice({ vendorId, productId }) {
  const vend = usbDevices.get(vendorId);
  return vend ? vend.get(productId) : undefined;
}

/**
 * @param {{vendorId: Number, productId: Number}} device
 * @returns {Boolean}
 */
export function isKnownDevice(device) {
  return !!getDevice(device);
}
