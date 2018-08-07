const frozenSet = function(key) {
  throw `Can't add/update entry for ${key} as it is frozen.`;
};

const frozenDelete = function(key) {
  throw `Can't delete entry for ${key} as it is frozen.`;
};

const frozenClear = function() {
  throw `Can't clear map as it is frozen.`;
};

export function freeze(map) {
  map.set = frozenSet;
  map.delete = frozenDelete;
  map.clear = frozenClear;

  Object.freeze(map);
  return map;
}
