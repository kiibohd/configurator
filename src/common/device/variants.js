import { freeze as freezeMap } from '../utils/map';
import { names, variants } from './keyboard';

function row(strings) {
  const keys = [];
  const defs = strings[0].split(' ');

  for (let i = 0, left = 0; i < defs.length; i++) {
    const def = defs[i];
    if (!def.length) continue;
    const key = {
      size: parseFloat(def),
      left,
      isSpace: def.includes('s'),
      isDifference: def.includes('d'),
      isVertical: def.includes('v')
    };
    keys.push(key);
    left += key.size;
  }

  return keys;
}

function buildDetailsList() {
  const variant = (name, rows, keys) => ({ name, rows, keys });

  // TODO Define Ergodox layout
  // const edox = [variant(variants.Default, [], [])];

  const inf60 = [
    variant(
      variants.Standard,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 1.75 1`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 1.25d 1.25d`
      ]
    ),
    variant(
      variants.Hacker,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 1.75 1`,
        row`1.5d 1d 1.5d 6d 1.5d 1d 1d 1.5d`
      ]
    )
  ];

  const inf60Led = [
    variant(
      variants.Standard,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1d 1d`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 1.75d 1d`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 1.25d 1.25d`
      ]
    ),
    variant(
      variants.Hacker,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1d 1d`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 1.75d 1d`,
        row`1.5d 1d 1.5d 6d 1.5d 1d 1d 1.5d`
      ]
    ),
    variant(
      variants.Alphabet,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 2.75d`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 1.25d 1.25d`
      ]
    )
  ];

  const whitefox = [
    variant(
      variants.TrueFox,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1d 1d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5d 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25d 1`,
        row`2.25d 1 1 1 1 1 1 1 1 1 1 1.75d 1d 1`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 0.5s 1 1 1`
      ]
    ),
    variant(
      variants.Aria,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5d 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25d 1`,
        row`2.25d 1 1 1 1 1 1 1 1 1 1 1.75d 1d 1`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 0.5s 1 1 1`
      ]
    ),
    variant(
      variants.Iso,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5s 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 1d 1.25d 1`,
        row`1.25d 1d 1 1 1 1 1 1 1 1 1 1 1.75d 1d 1`,
        row`1.25d 1.25d 1.25d 6.25d 1d 1d 1d 1 1 1`
      ]
    ),
    variant(
      variants.Vanilla,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5d 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25d 1`,
        row`2.25d 1 1 1 1 1 1 1 1 1 1 1.75d 1d 1`,
        row`1.25d 1.25d 1.25d 6.25d 1d 1d 1d 1 1 1`
      ]
    ),
    variant(
      variants.JackOfAllTrades,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5d 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25d 1`,
        row`2.25d 1 1 1 1 1 1 1 1 1 1 2.75d 1`,
        row`1.25d 1.25d 1.25d 6.25d 1.25d 1.25d 0.5s 1 1 1`
      ]
    ),
    variant(
      variants.Wkl,
      [0, 1, 2, 3, 4],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2d 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5d 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25d 1`,
        row`2.25d 1 1 1 1 1 1 1 1 1 1 1.75d 1d 1`,
        row`1.5d 1.5d 7d 1.5d 1.5d 1 1 1`
      ]
    )
  ];

  const ktype = [
    variant(
      variants.Standard,
      [0, 1.5, 2.5, 3.5, 4.5, 5.5],
      [
        row`1 1s 1 1 1 1 0.5s 1 1 1 1 0.5s 1 1 1 1 0.5s 1 1 1`,
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2 0.5s 1 1 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5 0.5s 1 1 1`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25`,
        row`2.25 1 1 1 1 1 1 1 1 1 1 2.75 1.5s 1`,
        row`1.25 1.25 1.25 6.25 1.25 1.25 1.25 1.25 0.5s 1 1 1`
      ]
    )
  ];

  const kira = [
    variant(
      variants.Standard,
      [0, 1, 2, 3, 4, 5],
      [
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1`,
        row`1 1 1 1 1 1 1 1 1 1 1 1 1 2 1 1 1 1`,
        row`1.5 1 1 1 1 1 1 1 1 1 1 1 1 1.5 1 1 1 1v`,
        row`1.75 1 1 1 1 1 1 1 1 1 1 1 2.25 1 1 1 `,
        row`2.25 1 1 1 1 1 1 1 1 1 1 1.75 1 1 1 1 1v`,
        row`1.25 1.25 1.25 6.25 1.5 1.5 1 1 1 1 1`
      ]
    )
  ];

  return freezeMap(
    new Map([
      // [names.InfinityErgodox, edox],
      [names.Infinity60, inf60],
      [names.Infinity60Led, inf60Led],
      [names.WhiteFox, whitefox],
      [names.KType, ktype],
      [names.Kira, kira]
    ])
  );
}

export const variantDetails = buildDetailsList();
