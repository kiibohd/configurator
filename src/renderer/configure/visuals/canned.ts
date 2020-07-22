import chroma from 'chroma-js';
import { ConfigCannedConfigurableItem } from '../../../common/config';
import { Rgb, isString } from '../../../common/utils';

export type ColorSpace = 'rgb' | 'rgba' | 'hsl' | 'hsv' | 'hsi' | 'lab' | 'lch' | 'hcl' | 'cmyk' | 'gl';

export type InterpData = Dictionary<string | number | Rgb>;

function interp(c1: chroma.Color, c2: chroma.Color, pct?: number, space: ColorSpace = 'lab') {
  return c2 && pct ? chroma.mix(c1, c2, pct, space) : c1;
}

const black = chroma('black');

function constructColor(
  value: string | number | Rgb,
  data: InterpData,
  interpTo: string | number,
  interpPct: string,
  darkenPct?: string
): string {
  let color = chroma(value);

  if (interpTo) {
    const to = chroma(isString(interpTo) && interpTo.startsWith('#') ? interpTo : data[interpTo]);
    const pct = interpPct && parseFloat(interpPct);
    color = interp(color, to, pct || 0);
  }

  if (darkenPct) {
    const dark = parseFloat(darkenPct);
    color = interp(color, black, dark);
  }

  const rgb = color.rgb();
  return `${rgb[0]},${rgb[1]},${rgb[2]}`;
}

function processV1(configurable: ConfigCannedConfigurableItem[], data: InterpData, str: string): string {
  let processed = str;

  for (let i = 0; i < configurable.length; i++) {
    const name = configurable[i].name;
    const value = data[name];
    let rx: RegExp;
    switch (configurable[i].type) {
      case 'color':
        rx = new RegExp(`\\$\\{${name}:?([\\w.#]+)?:?([\\d.]+)?!?([\\d.]+)?}`, 'g');
        processed = processed.replace(rx, (_, interpTo, interpPct, darkenPct) =>
          constructColor(value, data, interpTo, interpPct, darkenPct)
        );
        break;
      case 'select':
      default:
        // Should be a string at this point
        processed = processed.replace(`\${${name}}`, value as string);
    }
  }

  return processed;
}

export function process(
  configurable: ConfigCannedConfigurableItem[],
  data: InterpData,
  str: string,
  version = 1
): string {
  switch (version) {
    default:
      return processV1(configurable, data, str);
  }
}
