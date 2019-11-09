import path from 'path';
import fs from 'fs';
import mkdirpNode from 'mkdirp';
// import JSZip from 'jszip';
// import _ from 'lodash';
import log from 'loglevel';
import { directoryExists, rmrfSync } from '../../common/utils/fs-ext';
import { paths } from '../env';
import Bluebird from 'bluebird';

const access = Bluebird.promisify(fs.access);
const writeFile = Bluebird.promisify(fs.writeFile);
const mkdirp = Bluebird.promisify(mkdirpNode);

const info = {
  version: '1.5.2',
  uris: {
    bin: 'https://github.com/kiibohd/kiidrv/releases/download/v1.5.2-kiidrv/kiidrv-x64-Release.exe',
    conf: 'https://github.com/kiibohd/kiidrv/releases/download/v1.5.2-kiidrv/kiibohd.conf'
  },
  config: `[
  {
    "vid":    "0x1c11",
    "pid":    "0xb04d",
    "interface": 0,
    "vendor": "Input Club",
    "driver": "libusbK"
  },
  {
    "vid":    "0x1c11",
    "pid":    "0xb04d",
    "interface": 5,
    "vendor": "Input Club",
    "driver": "libusbK"
  },
  {
    "vid":    "0x1c11",
    "pid":    "0xb007",
    "interface": 0,
    "vendor": "Input Club",
    "driver": "libusbK"
  },
  {
    "vid":    "0x1209",
    "pid":    "0x01CB",
    "interface": 0,
    "vendor": "Input Club",
    "driver": "libusbK"
  },
  {
    "vid":    "0x1209",
    "pid":    "0x01C0",
    "interface": 0,
    "vendor": "Input Club",
    "driver": "libusbK"
  },
  {
    "vid":    "0x308F",
    "pid":    "0x0012",
    "interface": 0,
    "vendor": "Input Club",
    "driver": "libusbK"
  },
  {
    "vid":    "0x308F",
    "pid":    "0x0013",
    "interface": 0,
    "vendor": "Input Club",
    "driver": "libusbK"
  },
  {
    "vid":    "0x308F",
    "pid":    "0x0013",
    "interface": 5,
    "vendor": "Input Club",
    "driver": "libusbK"
  }
]`
};

export async function findKiidrvPath(): Promise<string> {
  if (process.platform !== 'win32') {
    return '';
  }

  const localpath = path.join(paths.utils, `kiidrv_v${info.version}`, 'kiidrv.exe');
  try {
    await access(localpath);
    return localpath;
  } catch {
    // Just swallow
  }

  return '';
}

export async function checkVersion(): Promise<Optional<string>> {
  if (process.platform !== 'win32') {
    return;
  }

  const dir = path.join(paths.utils, `kiidrv_v${info.version}`);
  const exists = await directoryExists(dir);
  if (exists) {
    return;
  }

  try {
    const data = await fetch(info.uris.bin, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Kiibohd Configurator'
      }
    }).then(r => r.arrayBuffer());

    const outpath = path.join(dir, 'kiidrv.exe');

    await mkdirp(dir);
    await writeFile(outpath, Buffer.from(data));
    await writeFile(path.join(dir, 'kiibohd.conf'), info.config);
    return outpath;

    // XXX Below for when moving to zip XXX
    // const zip = new JSZip();
    // const contents = await zip.loadAsync(data);

    // await mkdirp(dir);

    // _.forOwn(contents.files, async (file, filepath) => {
    //   if (file.dir) {
    //     return;
    //   }
    //   const data = await contents.file(filepath).async('nodebuffer');
    //   const filename = path.parse(filepath).base;
    //   const outpath = path.join(dir, filename);
    //   await writeFile(outpath, data);
    // });

    // return path.join(dir, 'kiidrv.exe');
  } catch (e) {
    log.error('Error updating kiidrv - ', e);
    rmrfSync(dir);
  }

  return;
}
