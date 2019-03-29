import _ from 'lodash';
import log from 'loglevel';
import { createSharedState } from '../shared-state/index';
import db from '../db';
import { findDfuPath } from '../local-storage/dfu-util';
import { findKiidrvPath } from '../local-storage/kiidrv';

const dev = process.env.NODE_ENV === 'development';

log.setDefaultLevel(dev ? log.levels.INFO : log.levels.ERROR);

// const defaultUri = dev ? 'http://localhost:8080' : 'https://configurator.input.club';
const defaultUri = dev ? 'http://localhost:8080' : 'http://vash.input.club:3001';

const DbKey = {
  dfuPath: 'dfu-path',
  kiidrvPath: 'kiidrv-path',
  lastDl: 'last-download',
  recentDls: 'recent-dls',
  lastVerCheck: 'last-version-check',
  cannedAnimations: 'canned-animations',
  uri: dev ? 'uri-development' : 'uri-production',
  firmwareVersion: 'firmware-version'
};

/**
 * @type{{
 *  uri: string
 *  locale: string
 *  dfu: string
 *  kiidrv: string
 *  dev: boolean
 *  lastVersionCheck: number
 *  newerVersionAvail: boolean
 *  lastDl: import('../local-storage/firmware').FirmwareResult
 *  firmwareVersion: string
 *  recentDls: Object<string, import('../local-storage/firmware').FirmwareResult[]>
 *  cannedAnimations: Object<string, import('../../common/config/types').ConfigAnimation>
 * }}
 */
const initialState = {
  uri: '',
  locale: 'en-us',
  dev,
  dfu: undefined,
  kiidrv: undefined,
  lastVersionCheck: 0,
  newerVersionAvail: false,
  lastDl: undefined,
  firmwareVersion: 'latest',
  recentDls: {},
  cannedAnimations: {}
};

const {
  useSharedState: useSettingsState,
  setSharedState: setSettingsState,
  getSharedState: getSettingsState
} = createSharedState(initialState);

export { useSettingsState };

export { getSettingsState as _currentState };

export async function loadFromDb() {
  setSettingsState('kiidrv', (await db.core.get(DbKey.kiidrvPath)) || (await findKiidrvPath()));
  setSettingsState('lastDl', await db.core.get(DbKey.lastDl));
  setSettingsState('firmwareVersion', await db.core.get(DbKey.firmwareVersion));
  setSettingsState('recentDls', (await db.core.get(DbKey.recentDls)) || {});
  setSettingsState('lastVersionCheck', (await db.core.get(DbKey.lastVerCheck)) || 0);
  setSettingsState('cannedAnimations', (await db.core.get(DbKey.cannedAnimations)) || {});
  // setSettingsState('locale', (await db.core.get(DbKey.locale)) || 'en-us');
  setSettingsState('uri', (await db.core.get(DbKey.uri)) || defaultUri);
  setSettingsState('dfu', (await db.core.get(DbKey.dfuPath)) || (await findDfuPath()));
}

/**
 * @param {string} uri
 */
export async function updateUri(uri) {
  setSettingsState('uri', uri);
  await db.core.set(DbKey.uri, uri);
}

/**
 * @param {boolean} newerAvail
 */
export async function updateNewerVersionAvail(newerAvail) {
  setSettingsState('newerVersionAvail', newerAvail);
  const now = Date.now();
  setSettingsState('lastVersionCheck', now);
  await db.core.set(DbKey.lastVerCheck, now);
}

/**
 * @param {string} dfu
 */
export async function updateDfu(dfu) {
  setSettingsState('dfu', dfu);
  await db.core.set(DbKey.dfuPath, dfu);
}

/**
 * @param {string} kiidrv
 */
export async function updateKiidrv(kiidrv) {
  setSettingsState('kiidrv', kiidrv);
  await db.core.set(DbKey.kiidrvPath, kiidrv);
}

/**
 * @param {import('../local-storage/firmware').FirmwareResult} download
 */
export async function addDownload(download) {
  const key = `${download.board}__${download.variant}`;
  setSettingsState('lastDl', download);
  setSettingsState('recentDls', curr => {
    const dls = (curr[key] || []).filter(x => x.hash !== download.hash);
    const updated = { ...curr, ...{ [key]: _.take([download, ...dls], 5) } };
    db.core.set(DbKey.recentDls, updated);
    return updated;
  });

  await db.core.set(DbKey.lastDl, download);
  await db.dl.set(download.time.toString(), download);
}

/**
 * @param {import('../local-storage/firmware').FirmwareResult} download
 */
export function setLastDl(download) {
  setSettingsState('lastDl', download);
}

/**
 * @param {string} version
 */
export async function updateFirmwareVersion(version) {
  setSettingsState('firmwareVersion', version);
  await db.core.set(DbKey.firmwareVersion, version);
}
