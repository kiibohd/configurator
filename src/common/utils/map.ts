// TODO: Remove this with usage of ReadonlyMap<K, V>

const frozenSet = function <K>(key: K) {
  throw `Can't add/update entry for ${key} as it is frozen.`;
};

const frozenDelete = function <K>(key: K) {
  throw `Can't delete entry for ${key} as it is frozen.`;
};

const frozenClear = function () {
  throw `Can't clear map as it is frozen.`;
};

export function freeze<K, V>(map: Map<K, V>) {
  map.set = frozenSet;
  map.delete = frozenDelete;
  map.clear = frozenClear;

  Object.freeze(map);
  return map;
}
