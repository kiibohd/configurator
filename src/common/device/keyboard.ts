import { Keyboard, KnownDevice, UsbIdentifier } from './types';

export enum Names {
  InfinityErgodox = 'Infinity Ergodox',
  Infinity60Led = 'Infinity 60% LED',
  Infinity60 = 'Infinity 60%',
  WhiteFox = 'WhiteFox',
  KType = 'K-Type',
  Kira = 'Kira'
}

export enum Variants {
  Default = 'Default',
  Standard = 'Standard',
  Hacker = 'Hacker',
  Alphabet = 'Alphabet',
  TrueFox = 'The True Fox',
  Aria = 'Aria',
  Vanilla = 'Vanilla',
  Iso = 'Iso',
  Wkl = 'Winkeyless',
  JackOfAllTrades = 'Jack of All Trades'
}

export const released = [
  Names.WhiteFox,
  Names.Kira,
  Names.KType,
  Names.Infinity60,
  Names.Infinity60Led,
  Names.InfinityErgodox
];

function buildKeyboardList(): Keyboard[] {
  function layouts(...layouts: [string, string[]][]): Dictionary<string[]> {
    return layouts.reduce((o, [v, ls]) => {
      o[v] = ls;
      return o;
    }, {} as Dictionary<string[]>);
  }

  return [
    {
      display: Names.InfinityErgodox,
      names: ['MDErgo1', 'Infinity_Ergodox'],
      variants: [Variants.Default],
      visuals: false,
      layouts: layouts([Variants.Default, ['Default', 'Blank']]),
      info: {
        isSplit: true
      }
    },
    {
      display: Names.Infinity60Led,
      names: ['MD1.1', 'Infinity_60%_LED', 'Infinity_60_LED'],
      variants: [Variants.Standard, Variants.Hacker, Variants.Alphabet],
      visuals: false,
      layouts: layouts(
        [Variants.Standard, ['Standard', 'StandardBlank']],
        [Variants.Hacker, ['Hacker', 'HackerBlank']],
        [Variants.Alphabet, ['Alphabet', 'AlphabetBlank']]
      ),
      info: {}
    },
    {
      display: Names.Infinity60,
      names: ['MD1', 'Infinity_60%', 'Infinity_60'],
      variants: [Variants.Standard, Variants.Hacker],
      visuals: false,
      layouts: layouts(
        [Variants.Standard, ['Standard', 'StandardBlank']],
        [Variants.Hacker, ['Hacker', 'HackerBlank']]
      ),
      info: {}
    },
    {
      display: Names.WhiteFox,
      names: ['WhiteFox'],
      variants: [
        Variants.TrueFox,
        Variants.Aria,
        Variants.Iso,
        Variants.Vanilla,
        Variants.JackOfAllTrades,
        Variants.Wkl
      ],
      visuals: false,
      layouts: layouts(
        [Variants.TrueFox, ['TheTrueFox']],
        [Variants.Aria, ['Aria']],
        [Variants.Iso, ['Iso']],
        [Variants.Vanilla, ['Vanilla']],
        [Variants.JackOfAllTrades, ['JackofAllTrades']],
        [Variants.Wkl, ['Winkeyless']]
      ),
      info: {}
    },
    {
      display: Names.KType,
      names: ['KType', 'K-Type'],
      variants: [Variants.Standard],
      visuals: true,
      layouts: layouts([Variants.Standard, ['Standard', 'NoAnimations']]),
      info: {}
    },
    {
      display: Names.Kira,
      names: ['Kira'],
      variants: [Variants.Standard],
      visuals: true,
      layouts: layouts([Variants.Standard, ['Standard']]),
      info: {
        resetCombo: '"Right Ctrl + Right Shift + Esc"'
      }
    }
  ];
}

type VarDef = [number, boolean, Names[], Variants?];

function buildDeviceList(): ReadonlyMap<number, ReadonlyMap<number, KnownDevice>> {
  // const list: (number | [number, boolean, Names[], Variants?])[][] = [
  // const list: (number | VarDef)[][] = [
  const list: { vid: number; devs: VarDef[] }[] = [
    // Un-official original I:C vid/pid combo
    {
      vid: 0x1c11,
      devs: [
        [0xb04d, false, [Names.InfinityErgodox, Names.Infinity60, Names.Infinity60Led, Names.WhiteFox, Names.KType]],
        [0xb007, true, [Names.InfinityErgodox, Names.Infinity60, Names.Infinity60Led, Names.WhiteFox, Names.KType]]
      ]
    },
    // Semi-official I:C shared VID
    {
      vid: 0x1209,
      devs: [
        [0x01c0, false, [Names.InfinityErgodox, Names.Infinity60, Names.Infinity60Led, Names.WhiteFox, Names.KType]],
        [0x01cb, true, [Names.InfinityErgodox, Names.Infinity60, Names.Infinity60Led, Names.WhiteFox, Names.KType]]
      ]
    },
    // Official I:C VID with unique PIDs
    {
      vid: 0x308f,
      devs: [
        [0x0000, true, [Names.Infinity60]],
        [0x0001, false, [Names.Infinity60], Variants.Standard],
        [0x0002, false, [Names.Infinity60], Variants.Hacker],
        [0x0003, true, [Names.InfinityErgodox], Variants.Default],
        [0x0004, false, [Names.InfinityErgodox], Variants.Default],
        [0x0005, true, [Names.WhiteFox]],
        [0x0006, false, [Names.WhiteFox], Variants.Vanilla],
        [0x0007, false, [Names.WhiteFox], Variants.Iso],
        [0x0008, false, [Names.WhiteFox], Variants.Aria],
        [0x0009, false, [Names.WhiteFox], Variants.Wkl],
        [0x000a, false, [Names.WhiteFox], Variants.TrueFox],
        [0x000b, false, [Names.WhiteFox], Variants.JackOfAllTrades],
        [0x000c, true, [Names.Infinity60Led]],
        [0x000d, false, [Names.Infinity60Led], Variants.Standard],
        [0x000e, false, [Names.Infinity60Led], Variants.Hacker],
        [0x000f, false, [Names.Infinity60Led], Variants.Alphabet],
        [0x0010, true, [Names.KType], Variants.Standard],
        [0x0011, false, [Names.KType], Variants.Standard],
        [0x0012, true, [Names.Kira], Variants.Standard],
        [0x0013, false, [Names.Kira], Variants.Standard]
      ]
    }
  ];

  function device(
    vid: number,
    pid: number,
    isFlashable: boolean,
    names: Names[],
    variant: Optional<Variants>
  ): KnownDevice {
    return Object.freeze({
      vid,
      pid,
      isFlashable: isFlashable || false,
      isUnique: names.length === 1,
      names,
      variant
    });
  }

  function devices(vid: number, ...devices: VarDef[]): [number, ReadonlyMap<number, KnownDevice>] {
    return [vid, new Map(devices.map(b => [b[0], device(vid, ...b)]))];
  }

  return new Map(list.map(x => devices(x.vid, ...x.devs)));
}

export const keyboards = buildKeyboardList();

export const usbDevices = buildDeviceList();

export function getDevice({ vendorId, productId }: UsbIdentifier): Optional<KnownDevice> {
  const vend = usbDevices.get(vendorId);
  return vend ? vend.get(productId) : undefined;
}

export function isKnownDevice(device: Optional<UsbIdentifier>): boolean {
  return !!device && !!getDevice(device);
}
