import JSZip from 'jszip';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import { paths } from '../env';
import Bluebird from 'bluebird';

const writeFile = Bluebird.promisify(fs.writeFile);

export interface FileDescription {
  board: string;
  layout: string;
  hash: string;
  isError: boolean;
}

export interface FirmwareResult {
  board: string;
  variant: string;
  layout: string;
  hash: string;
  isError: boolean;
  bin: string | { left: string; right: string };
  json: string;
  log: string;
  time: number;
}

const logPath = 'log/build.log';
const binFile = 'kiibohd.dfu.bin';

export function parseFilename(filename: string): FileDescription {
  // Filename should look like
  //  ./tmp/KType-Standard-faa2f95d65d08c5eaf9a849d5573eb1b.zip
  //  ./tmp/KType-Standard-2471b9e6c95f2a4f924e116c7acb33c4_error.zip
  const rx = /^\.\/[^/]+\/+([A-Za-z0-9_.-]+)-([A-Za-z0-9_.-]+)-([0-9A-Fa-f]+)(_error)?/;
  const [, board, layout, hash, isError] = rx.exec(filename) ?? [];

  return { board, layout, hash, isError: !!isError };
}

/**
 * Store firmware in the local cache.
 */
export async function storeFirmware(
  { board, layout, hash, isError }: FileDescription,
  variant: string,
  data: ArrayBuffer
): Promise<FirmwareResult> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(data);
  const jsonName = `${board}-${layout}.json`;
  const subdir = `${board}_${layout}_${hash}`;
  const outdir = path.join(paths.firmwareCache, subdir);

  async function extract(file: string, out?: string, critical = false) {
    try {
      const outpath = path.join(outdir, out || file);
      const data = await contents.file(file).async('nodebuffer');
      await writeFile(outpath, data);
      return outpath;
    } catch (e) {
      if (critical) {
        throw e;
      }
      // TODO: Need detection here
      return '';
    }
  }

  await mkdirp(outdir);

  const result = {
    board,
    variant,
    layout,
    hash,
    isError,
    bin:
      board === 'MDErgo1'
        ? {
            left: await extract('left_' + binFile, undefined, true),
            right: await extract('right_' + binFile, undefined, true),
          }
        : await extract(binFile, undefined, true),
    json: await extract(jsonName),
    log: await extract(logPath, 'build.log'),
    time: Date.now(),
  };

  return result;
}

/**
 * Extract build log from firmware zip.
 */
export async function extractLog(data: ArrayBuffer): Promise<string> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(data);
  const log = await contents.file(logPath).async('text');

  return log;
}
