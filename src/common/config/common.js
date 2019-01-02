import _ from 'lodash';

export const Injection = {
  compile: {
    start: '\n#~~~START INJECTION~~~#\n',
    end: '\n#~~~END INJECTION~~~#\n'
  },
  animation: {
    start: '\n#~~~START ANIMATION (${__NAME__}) INJECTION~~~#\n',
    end: '\n#~~~END ANIMATION (${__NAME__}) INJECTION~~~#\n',
    tokenRx: /\$\{__NAME__\}/g
  }
};

/**
 * @param {string} value
 * @param {string} start
 * @param {string} end
 */
export function stripInjection(value, start, end) {
  let dejected = value;
  let i = dejected.indexOf(start);
  while (i >= 0) {
    const j = dejected.indexOf(end, i);
    dejected = dejected.substring(0, i) + dejected.substring(j + end.length);
    i = dejected.indexOf(start);
  }
  return dejected;
}

/**
 * @param {import('./types').ConfigMatrix} matrix
 * @param {number} scaleFactor
 */
export function getSize(matrix, scaleFactor = 1) {
  const right = _.maxBy(matrix, k => k.x + k.w);
  const bottom = _.maxBy(matrix, k => k.y + k.h);

  return {
    height: (bottom.y + bottom.h) * scaleFactor,
    width: (right.x + right.w) * scaleFactor
  };
}

/**
 * @param {import('./types').ConfigMacro} macro
 * @return {boolean}
 */
export function validMacro(macro) {
  return (
    macro.name.length &&
    macro.output.length &&
    !macro.output.some(x => !x.length || x.includes('')) &&
    macro.trigger.length &&
    !macro.output.some(x => !x.length || x.includes(''))
  );
}

/**
 * @param {string[]} frames
 * @returns {string}
 */
export function framesToString(frames) {
  return frames.map(f => (_.trimStart(f).length && !_.trimStart(f).startsWith('#') ? f + ';' : f)).join('\n');
}
