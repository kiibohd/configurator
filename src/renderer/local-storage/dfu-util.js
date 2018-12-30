import JSZip from 'jszip';
import path from 'path';
import fs from 'fs';
import mkdirpNode from 'mkdirp';
import _ from 'lodash';
import log from 'loglevel';
import { paths } from '../env';
import { directoryExists, rmrfSync } from '../../common/utils/fs-ext';
import commandExists from 'command-exists';
import Bluebird from 'bluebird';

const access = Bluebird.promisify(fs.access);
const writeFile = Bluebird.promisify(fs.writeFile);
const chmod = Bluebird.promisify(fs.chmod);
const mkdirp = Bluebird.promisify(mkdirpNode);

const info = {
  version: '0.9',
  uris: {
    win32: 'http://dfu-util.sourceforge.net/releases/dfu-util-0.9-win64.zip',
    darwin: 'https://github.com/kiibohd/dfu-util/releases/download/v0.9-kiibohd/dfu-util-v0.9-kiibohd.zip'
  }
};

export async function findDfuPath() {
  const win32 = process.platform === 'win32';
  const name = win32 ? 'dfu-util.exe' : 'dfu-util';

  // Prefer the configurator downloaded version (they can always override)
  const localpath = path.join(paths.utils, `dfu-util_v${info.version}`, win32 ? 'dfu-util.exe' : 'dfu-util');
  try {
    await access(localpath);
    return localpath;
  } catch {
    // Just swallow
  }

  try {
    const onPath = await commandExists(name);
    if (onPath) {
      return 'dfu-util';
    }
  } catch {
    // Just swallow
  }

  return '';
}

/**
 * @returns {Promise<string>}
 */
export async function checkVersion() {
  const dir = path.join(paths.utils, `dfu-util_v${info.version}`);
  const exists = await directoryExists(dir);
  const uri = info.uris[process.platform];
  if (exists || !uri) {
    return null;
  }

  const win32 = process.platform === 'win32';

  try {
    const data = await fetch(uri, {
      headers: {
        'User-Agent': 'Kiibohd Configurator'
      }
    }).then(r => r.arrayBuffer());

    const zip = new JSZip();
    const contents = await zip.loadAsync(data);

    await mkdirp(dir);

    _.forOwn(contents.files, async (file, filepath) => {
      if (file.dir) {
        return;
      }
      const data = await contents.file(filepath).async('nodebuffer');
      const filename = path.parse(filepath).base;
      const outpath = path.join(dir, filename);
      await writeFile(outpath, data);
      if (!win32 && filename === 'dfu-util') {
        await chmod(outpath, '755');
      }
    });

    return path.join(dir, win32 ? 'dfu-util.exe' : 'dfu-util');
  } catch (e) {
    log.error('Error updating dfu-util - ', e);
    rmrfSync(dir);
  }
}
