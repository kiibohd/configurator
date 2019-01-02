import chroma from 'chroma-js';

/**
 * @param {import('../../../common/config/types').ConfigCannedConfigurableItem[]} configurable
 * @param {Object} data
 * @param {string} str
 * @param {number} version
 * @returns {string[]}
 */
export function process(configurable, data, str, version = 1) {
  switch (version) {
    default:
      return process_v1(configurable, data, str);
  }
}

/**
 * @param {import('../../../common/config/types').ConfigCannedConfigurableItem[]} configurable
 * @param {Object} data
 * @param {string} str
 * @returns {string}
 */
function process_v1(configurable, data, str) {
  let processed = str;

  for (let i = 0; i < configurable.length; i++) {
    const name = configurable[i].name;
    const value = data[name];
    switch (configurable[i].type) {
      case 'color':
        var rx = new RegExp(`\\$\\{${name}:?([\\w.#]+)?:?([\\d.]+)?!?([\\d.]+)?}`, 'g');
        processed = processed.replace(rx, (_, interpTo, interpPct, darkenPct) =>
          constructColor(value, data, interpTo, interpPct, darkenPct)
        );
        break;
      case 'select':
      default:
        processed = processed.replace(`\${${name}}`, value);
    }
  }

  return processed;
}

/**
 * @returns {chroma.Color}
 */
function interp(c1, c2, pct, space = 'lab') {
  return c2 && pct ? chroma.mix(c1, c2, pct, space) : c1;
}

const black = chroma('black');
function constructColor(value, data, interpTo, interpPct, darkenPct) {
  let color = chroma(value);

  if (interpTo) {
    const to = chroma(interpTo.startsWith('#') ? interpTo : data[interpTo]);
    const pct = interpPct && parseFloat(interpPct);
    color = interp(color, to, pct || 0);
  }

  if (darkenPct) {
    const dark = darkenPct && parseFloat(darkenPct);
    color = interp(color, black, dark);
  }

  const rgb = color.rgb();
  return `${rgb[0]},${rgb[1]},${rgb[2]}`;
}
