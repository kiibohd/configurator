import _ from 'lodash';
import log from 'loglevel';
import { createSharedState } from '../shared-state/index';
import db from '../db';
import { findDfuPath } from '../local-storage/dfu-util';
import { findKiidrvPath } from '../local-storage/kiidrv';
import { FirmwareVersions, ConfigAnimation } from '../../common/config';
import { FirmwareResult } from '../local-storage/firmware';
import { AvailableLocales } from '../../common/keys';

const dev = process.env.NODE_ENV === 'development';

log.setDefaultLevel(dev ? log.levels.INFO : log.levels.ERROR);

// const defaultUri = dev ? 'http://localhost:8080' : 'http://vash.input.club:80';
const defaultUri = 'http://vash.input.club';

const DbKey = {
  dfuPath: 'dfu-path',
  kiidrvPath: 'kiidrv-path',
  lastDl: 'last-download',
  recentDls: 'recent-dls',
  lastVerCheck: 'last-version-check',
  firmwareVersions: 'firmware-versions',
  cannedAnimations: 'canned-animations',
  uri: dev ? 'uri-development' : 'uri-production',
};

type SettingsState = {
  uri: string;
  locale: AvailableLocales;
  dfu: Optional<string>;
  kiidrv: Optional<string>;
  dev: boolean;
  lastVersionCheck: number;
  newerVersionAvail: boolean;
  firmwareVersions: Optional<FirmwareVersions>;
  lastDl: Optional<FirmwareResult>;
  recentDls: Dictionary<FirmwareResult[]>;
  cannedAnimations: Dictionary<ConfigAnimation>;
};

const initialState: SettingsState = {
  uri: '',
  locale: 'en-us',
  dev,
  dfu: undefined,
  kiidrv: undefined,
  lastVersionCheck: 0,
  newerVersionAvail: false,
  firmwareVersions: undefined,
  lastDl: undefined,
  recentDls: {},
  cannedAnimations: {},
};

const {
  useSharedState: useSettingsState,
  setSharedState: setSettingsState,
  getSharedState: getSettingsState,
} = createSharedState(initialState);

export { useSettingsState };

export { getSettingsState as _currentState };

export async function loadFromDb() {
  setSettingsState('kiidrv', (await db.core.get(DbKey.kiidrvPath)) || (await findKiidrvPath()));
  setSettingsState('lastDl', await db.core.get(DbKey.lastDl));
  setSettingsState('recentDls', (await db.core.get(DbKey.recentDls)) || {});
  setSettingsState('lastVersionCheck', (await db.core.get(DbKey.lastVerCheck)) || 0);
  setSettingsState('firmwareVersions', (await db.core.get(DbKey.firmwareVersions)) || undefined);
  setSettingsState('cannedAnimations', (await db.core.get(DbKey.cannedAnimations)) || {});
  // setSettingsState('locale', (await db.core.get(DbKey.locale)) || 'en-us');
  setSettingsState('uri', (await db.core.get(DbKey.uri)) || defaultUri);
  setSettingsState('dfu', (await db.core.get(DbKey.dfuPath)) || (await findDfuPath()));
}

export async function updateUri(uri: string) {
  setSettingsState('uri', uri);
  await db.core.set(DbKey.uri, uri);
}

export async function updateNewerVersionAvail(newerAvail: boolean) {
  setSettingsState('newerVersionAvail', newerAvail);
  const now = Date.now();
  setSettingsState('lastVersionCheck', now);
  await db.core.set(DbKey.lastVerCheck, now);
}

export async function updateFirmwareVersions(versions: FirmwareVersions) {
  setSettingsState('firmwareVersions', versions);
  await db.core.set(DbKey.firmwareVersions, versions);
}

export async function updateDfu(dfu: string) {
  setSettingsState('dfu', dfu);
  await db.core.set(DbKey.dfuPath, dfu);
}

export async function updateKiidrv(kiidrv: string) {
  setSettingsState('kiidrv', kiidrv);
  await db.core.set(DbKey.kiidrvPath, kiidrv);
}

export async function addDownload(download: FirmwareResult) {
  const key = `${download.board}__${download.variant}`;
  setSettingsState('lastDl', download);
  setSettingsState('recentDls', (curr) => {
    const dls = (curr[key] || []).filter((x) => x.hash !== download.hash);
    const updated = { ...curr, ...{ [key]: _.take([download, ...dls], 5) } };
    db.core.set(DbKey.recentDls, updated);
    return updated;
  });

  await db.core.set(DbKey.lastDl, download);
  await db.dl.set(download.time.toString(), download);
}

export function setLastDl(download: FirmwareResult) {
  setSettingsState('lastDl', download);
}
