import localforage from 'localforage';

const coreStore = localforage.createInstance({
  name: 'kiibohd-configurator',
  storeName: 'kiibohd-configurator'
});

const dlStore = localforage.createInstance({
  name: 'kiibohd-configurator-downloads',
  storeName: 'kiibohd-configurator-downloads'
});

function set<T>(store: LocalForage): (key: string, value: T) => Promise<T> {
  return (key, value) => store.setItem(key, value);
}

function get<T>(store: LocalForage): (key: string) => Promise<T> {
  return key => store.getItem(key);
}

function keys(store: LocalForage): () => Promise<string[]> {
  return () => store.keys();
}

export interface Db {
  get<T>(key: string): Promise<T>;
  set<T>(key: string, value: T): Promise<T>;
  keys(): Promise<string[]>;
}

const db: { core: Db; dl: Db } = {
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
