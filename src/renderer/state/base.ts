import { updateConfig } from './configure';

import { _currentState, updateNewerVersionAvail } from './settings';
import { updatePanel, Panels, reset as resetCoreState, popupSimpleToast, toggleLoading } from './core';
import { reset as resetConfigureState } from './configure';
import _ from 'lodash';
import fs from 'fs';
import Bluebird from 'bluebird';
import urljoin from 'url-join';
import compareVersions from 'compare-versions';
import electron from 'electron';
import { FirmwareVersions, PersistedConfig } from '../../common/config';
import { AvailableLocales } from '../../common/keys';
import { Keyboard } from '../../common/device/types';

const readFile = Bluebird.promisify(fs.readFile);

function resetConfig() {
  updatePanel(Panels.KeyboardSelect);
  resetCoreState();
  resetConfigureState();
}

export async function loadRemoteConfig(
  keyboard: Keyboard,
  variant: string,
  layout?: string,
  baseUri?: string,
  locale?: AvailableLocales
): Promise<void> {
  try {
    const defLayout = keyboard.layouts[variant][0];
    const uri = urljoin(baseUri || _currentState('uri'), 'layouts', `${keyboard.names[0]}-${layout || defLayout}.json`);
    toggleLoading();
    const config: PersistedConfig = await fetch(uri).then((resp) => resp.json());
    updateConfig(config, locale || _currentState('locale'));
    toggleLoading();
  } catch (e) {
    resetConfig();
    popupSimpleToast('error', 'Failed to load layout');
  }
}

export async function loadLocalConfig(filepath: string, locale?: AvailableLocales): Promise<void> {
  try {
    toggleLoading();
    const buffer = await readFile(filepath);
    const config = JSON.parse(buffer.toString('utf8'));
    updateConfig(config, locale || _currentState('locale'));
    toggleLoading();
  } catch (e) {
    resetConfig();
    popupSimpleToast('error', 'Failed to load layout');
  }
}

export async function loadDefaultConfig(keyboard: Keyboard, variant: string): Promise<void> {
  const recentDls = _currentState('recentDls');
  const recent = _.head(recentDls[`${keyboard.display}__${variant}`] || []);

  if (recent && fs.existsSync(recent.json)) {
    return loadLocalConfig(recent.json);
  }

  return loadRemoteConfig(keyboard, variant);
}

type VersionDetails = {
  version: string;
  url: string;
};

// TODO: Switch to Github API? https://github.com/github-tools/github
type GithubReleaseResponse = {
  url: string;
  html_url: string;
  tag_name: string;
};

export async function checkVersion(): Promise<Optional<VersionDetails>> {
  const now = Date.now();
  const lastCheck = _currentState('lastVersionCheck');
  if (now - lastCheck < 86400000) {
    return;
  }

  const uri = 'https://api.github.com/repos/kiibohd/configurator/releases/latest';
  const response: GithubReleaseResponse = await fetch(uri, {
    method: 'GET',
    headers: {
      'User-Agent': 'Kiibohd Configurator',
      Accept: 'application/json; charset=utf-8',
    },
  }).then((r) => r.json());

  const version = electron.remote.app.getVersion();
  const latest = response.tag_name;
  const newerAvail = compareVersions(latest, version) > 0;
  updateNewerVersionAvail(newerAvail);
  if (newerAvail) {
    return {
      version: latest,
      url: response.html_url,
    };
  }

  return;
}

export async function checkFirmwareVersions(): Promise<FirmwareVersions> {
  const baseUri = _currentState('uri');

  const uri = urljoin(baseUri, 'versions');

  const response = await fetch(uri, {
    method: 'GET',
    headers: {
      'User-Agent': 'Kiibohd Configurator',
      Accept: 'application/json; charset=utf-8',
    },
  }).then((r) => r.json() as Promise<FirmwareVersions>);

  return response;
}
