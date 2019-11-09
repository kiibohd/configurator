import _ from 'lodash';
import { ConfigMatrix, ConfigMacro } from './types';

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

export function stripInjection(value: string, start: string, end: string) {
  let dejected = value;
  let i = dejected.indexOf(start);
  while (i >= 0) {
    const j = dejected.indexOf(end, i);
    dejected = dejected.substring(0, i) + dejected.substring(j + end.length);
    i = dejected.indexOf(start);
  }
  return dejected;
}

export function getSize(matrix: ConfigMatrix, scaleFactor = 1) {
  const right = _.maxBy(matrix, k => k.x + k.w) || { x: 0, y: 0, h: 0, w: 0 };
  const bottom = _.maxBy(matrix, k => k.y + k.h) || { x: 0, y: 0, h: 0, w: 0 };

  return {
    height: (bottom.y + bottom.h) * scaleFactor,
    width: (right.x + right.w) * scaleFactor
  };
}

export function validMacro(macro: ConfigMacro): boolean {
  return !!(
    macro.name.length &&
    macro.output.length &&
    !macro.output.some(x => !x.length || x.includes('')) &&
    macro.trigger.length &&
    !macro.output.some(x => !x.length || x.includes(''))
  );
}

export function framesToString(frames: string[]): string {
  return frames.map(f => (_.trimStart(f).length && !_.trimStart(f).startsWith('#') ? f + ';' : f)).join('\n');
}
