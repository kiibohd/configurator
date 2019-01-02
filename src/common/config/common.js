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
