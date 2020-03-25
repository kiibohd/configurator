import { Names, Variants } from './keyboard';
import { KeyboardDetails, KeyDetails } from './types';

// TODO: This should all be done offline or during build time.

function row(strings: TemplateStringsArray): KeyDetails[] {
  const keys: KeyDetails[] = [];
  const defs = strings[0].split(' ');

  for (let i = 0, left = 0; i < defs.length; i++) {
    const def = defs[i];
    if (!def.length) continue;
    const key = {
      size: parseFloat(def),
      left,
      isSpace: def.includes('s'),
      isDifference: def.includes('d'),
      isVertical: def.includes('v'),
    };
    keys.push(key);
    left += key.size;
  }

  return keys;
}

function buildDetailsList(): Map<string, KeyboardDetails[]> {
  const variant = (name: string, rows: number[], keys: KeyDetails[][]): KeyboardDetails => ({ name, rows, keys });

  // TODO Define Ergodox layout
  // const edox = [variant(variants.Default, [], [])];

  const inf60 = [
    variant(
      Variants.Standard,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 1.75 1`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 1.25d 1.25d`,
      ]
    ),
    variant(
      Variants.Hacker,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 1.75 1`,
        row`1.5d 1d 1.5d 6d 1.5d 1d 1d 1.5d`,
      ]
    ),
  ];

  const inf60Led = [
    variant(
      Variants.Standard,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1d 1d`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 1.75d 1d`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 1.25d 1.25d`,
      ]
    ),
    variant(
      Variants.Hacker,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1d 1d`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 1.75d 1d`,
        row`1.5d 1d 1.5d 6d 1.5d 1d 1d 1.5d`,
      ]
    ),
    variant(
      Variants.Alphabet,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 2.75d`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 1.25d 1.25d`,
      ]
    ),
  ];

  const whitefox = [
    variant(
      Variants.TrueFox,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1d 1d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5d 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25d 1`,
        row`2.25d 1 1 1 1 1 1 1 1 1 1 1.75d 1d 1`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 0.5s 1 1 1`,
      ]
    ),
    variant(
      Variants.Aria,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5d 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25d 1`,
        row`2.25d 1 1 1 1 1 1 1 1 1 1 1.75d 1d 1`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 0.5s 1 1 1`,
      ]
    ),
    variant(
      Variants.Iso,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5s 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 1d 1.25d 1`,
        row`1.25d 1d 1 1 1 1 1 1 1 1 1 1 1.75d 1d 1`,
        row`1.25d 1.25d 1.25d 6.25d 1d 1d 1d 1 1 1`,
      ]
    ),
    variant(
      Variants.Vanilla,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5d 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25d 1`,
        row`2.25d 1 1 1 1 1 1 1 1 1 1 1.75d 1d 1`,
        row`1.25d 1.25d 1.25d 6.25d 1d 1d 1d 1 1 1`,
      ]
    ),
    variant(
      Variants.JackOfAllTrades,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5d 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25d 1`,
        row`2.25d 1 1 1 1 1 1 1 1 1 1 2.75d 1`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 0.5s 1 1 1`,
      ]
    ),
    variant(
      Variants.Wkl,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5d 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25d 1`,
        row`2.25d 1 1 1 1 1 1 1 1 1 1 1.75d 1d 1`,
        row`1.5d 1.5d 7d 1.5d 1.5d 1 1 1`,
      ]
    ),
  ];

  const ktype = [
    variant(
      Variants.Standard,
      [0, 1.5, 2.5, 3.5, 4.5, 5.5],
      [
        row`1 1s 1 1 1 1 0.5s 1 1 1 1 0.5s 1 1 1 1 0.5s 1 1 1`,
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2 0.5s 1 1 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5 0.5s 1 1 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 2.75 1.5s 1`,
        row`1.25 1.25 1.25 6.25 1.25 1.25 1.25 1.25 0.5s 1 1 1`,
      ]
    ),
  ];

  const kira = [
    variant(
      Variants.Standard,
      [0, 1, 2, 3, 4, 5],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1`,
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5 1 1 1 1v`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25 1 1 1 `,
        row`2.25 1 1 1 1 1 1 1 1 1 1 1.75 1 1 1 1 1v`,
        row`1.25 1.25 1.25 6.25 1.5 1.5 1 1 1 1 1`,
      ]
    ),
  ];

  return new Map([
    // [names.InfinityErgodox, edox],
    [Names.Infinity60, inf60],
    [Names.Infinity60Led, inf60Led],
    [Names.WhiteFox, whitefox],
    [Names.KType, ktype],
    [Names.Kira, kira],
  ]);
}

export const variantDetails: ReadonlyMap<string, KeyboardDetails[]> = buildDetailsList();
