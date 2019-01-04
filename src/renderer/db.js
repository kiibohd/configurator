import localforage from 'localforage';

const coreStore = localforage.createInstance({
  name: 'kiibohd-configurator',
  storeName: 'kiibohd-configurator'
});

const dlStore = localforage.createInstance({
  name: 'kiibohd-configurator-downloads',
  storeName: 'kiibohd-configurator-downloads'
});

/**
 * @param {LocalForage} store
 * @returns {(key: string, value: any) => Promise<any>}
 */
function set(store) {
  return (key, value) => store.setItem(key, value);
}

/**
 * @param {LocalForage} store
 * @returns {(key: string) => Promise<any>}
 */
function get(store) {
  return key => store.getItem(key);
}

/**
 * @param {LocalForage} store
 * @returns {() => Promise<any>}
 */
function keys(store) {
  return () => store.keys();
}

/**
 * @typedef {{
 *  get: (key: string) => Promise<any>
 *  set: (key: string, value: any) => Promise<any>
 *  keys: () => Promise<string[]>
 * }} Store
 */

/**
 * @type{{
 *  core: Store
 *  dl: Store
 * }}
 */
const db = {
  core: {
    get: get(coreStore),
    set: set(coreStore),
    keys: keys(coreStore)
  },
  dl: {
    get: get(dlStore),
    set: set(dlStore),
    keys: keys(dlStore)
  }
};

export default db;
