import JSZip from 'jszip';
import path from 'path';
import fs from 'fs';
import { paths } from '../env';
import Bluebird from 'bluebird';

const writeFile = Bluebird.promisify(fs.writeFile);
const mkdirp = Bluebird.promisify(require('mkdirp'));

/**
 * @typedef {{
 *  board: string
 *  layout: string
 *  hash: string
 *  isError: boolean
 * }} FileDescription
 */

/**
 * @typedef {{
 *  board: string
 *  variant: string
 *  layout: string
 *  hash: string
 *  isError: boolean
 *  bin: string | { left: string, right: string }
 *  json: string
 *  log: string
 *  time: number
 * }} FirmwareResult
 */

const logPath = 'log/build.log';
const binFile = 'kiibohd.dfu.bin';

/**
 * @param {string} filename
 * @returns {FileDescription}
 */
export function parseFilename(filename) {
  // Filename should look like
  //  ./tmp/KType-Standard-faa2f95d65d08c5eaf9a849d5573eb1b.zip
  //  ./tmp/KType-Standard-2471b9e6c95f2a4f924e116c7acb33c4_error.zip
  const rx = /^\.\/\w+\/([A-Za-z0-9_.-]+)-([A-Za-z0-9_.-]+)-([0-9A-Fa-f]+)(_error)?/;
  const [, board, layout, hash, isError] = rx.exec(filename);

  return { board, layout, hash, isError: !!isError };
}

/**
 * Store firmware in the local cache.
 * @param {FileDescription} fileDescr
 * @param {ArrayBuffer} data
 * @returns {Promise<FirmwareResult>}
 */
export async function storeFirmware({ board, layout, hash, isError }, variant, data) {
  const zip = new JSZip();
  const contents = await zip.loadAsync(data);
  const jsonName = `${board}-${layout}.json`;
  const subdir = `${board}_${layout}_${hash}`;
  const outdir = path.join(paths.firmwareCache, subdir);

  await mkdirp(outdir);

  return {
    board,
    variant,
    layout,
    hash,
    isError,
    bin:
      board === 'MDErgo1'
        ? {
            left: await extract('left_' + binFile),
            right: await extract('right_' + binFile)
          }
        : await extract(binFile),
    json: await extract(jsonName),
    log: await extract(logPath, 'build.log'),
    time: Date.now()
  };

  async function extract(file, out) {
    const outpath = path.join(outdir, out || file);
    const data = await contents.file(file).async('nodebuffer');
    await writeFile(outpath, data);
    return outpath;
  }
}

/**
 * Extract build log from firmware zip.
 * @param {ArrayBuffer} data
 * @returns {Promise<string>}
 */
export async function extractLog(data) {
  const zip = new JSZip();
  const contents = await zip.loadAsync(data);
  const log = await contents.file(logPath).async('text');

  return log;
}
