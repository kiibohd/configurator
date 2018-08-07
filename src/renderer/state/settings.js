import _ from 'lodash';
import { createSharedState } from '../shared-state/index';
import db from '../db';

const dev = process.env.NODE_ENV !== 'production';

const DbKey = {
  dfuPath: 'dfu-path',
  kiidrvPath: 'kiidrv-path',
  lastDl: 'last-download',
  recentDls: 'recent-dls',
  lastVerCheck: 'last-version-check',
  cannedAnimations: 'canned-animations'
};

const initialState = {
  uri: dev ? 'http://localhost:8080/' : 'https://configurator.input.club/',
  locale: 'en-us',
  dev,
  dfu: undefined,
  kiidrv: undefined,
  versionCheck: undefined,
  lastDl: undefined,
  recentDls: {},
  cannedAnimations: {}
};

const {
  useSharedState: useSettingsState,
  setSharedState: setSettingsState,
  getSharedState: getSettingsState
} = createSharedState(initialState);

export { useSettingsState };

/**
 * Internal use to get the current state of a setting
 * @param {"uri"|"locale"|"dev"|"dfu"|"kiidrv"|"versionCheck"|"lastDl"|"recentDls"|"cannedAnimations"} name
 */
export function _currentState(name) {
  return getSettingsState(name);
}

export async function loadFromDb() {
  setSettingsState('dfu', (await db.core.get(DbKey.dfuPath)) || '');
  setSettingsState('kiidrv', await db.core.get(DbKey.kiidrvPath));
  setSettingsState('lastDl', await db.core.get(DbKey.lastDl));
  setSettingsState('recentDls', (await db.core.get(DbKey.recentDls)) || {});
  setSettingsState('versionCheck', await db.core.get(DbKey.lastVerCheck));
  setSettingsState('cannedAnimations', (await db.core.get(DbKey.cannedAnimations)) || {});
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
