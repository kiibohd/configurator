export function isNumber(x: unknown): x is number {
  return typeof x === 'number';
}

export function isString(x: unknown): x is string {
  return typeof x === 'string';
}
