import path from 'path';
import electron from 'electron';

const dataDir = electron.remote.app.getPath('userData');
const firmwareCacheDir = path.join(dataDir, 'firmware-cache');
const utilsDir = path.join(dataDir, 'utils');
const configDir = path.join(dataDir, 'keyboard-config');

export const paths = {
  data: dataDir,
  firmwareCache: firmwareCacheDir,
  utils: utilsDir,
  config: configDir,
};
