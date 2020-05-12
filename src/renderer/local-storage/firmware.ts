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

type BaseFirmwareResult = {
  board: string;
  variant: string;
  layout: string;
  hash: string;
  isError: boolean;
  json: string;
  log: string;
  time: number;
};

export type SingleFirmwareResult = {
  bin: string;
  type: 'single';
} & BaseFirmwareResult;

export type SplitFirmwareResult = {
  bin: { left: string; right: string };
  type: 'split';
} & BaseFirmwareResult;

export type FirmwareResult = SingleFirmwareResult | SplitFirmwareResult;

// This is a little hacky, but since we have a type stored in the local db that isn't quite the right shape this will help
// normalize the structure. This looks slightly overblown, but it keeps the typescript compiler happy.
export function normalizeFirmwareResult(
  result: Optional<FirmwareResult | Omit<FirmwareResult, 'type'>>
): Optional<FirmwareResult> {
  if (result && !(result as FirmwareResult).type) {
    if (result.board === 'MDErgo1') {
      return {
        ...(result as Omit<SplitFirmwareResult, 'type'>),
        ...{ type: 'split' },
      };
    }

    return {
      ...(result as Omit<SingleFirmwareResult, 'type'>),
      ...{ type: 'single' },
    };
  }

  return result as Optional<FirmwareResult>;
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

  const result: BaseFirmwareResult = {
    board,
    variant,
    layout,
    hash,
    isError,
    json: await extract(jsonName),
    log: await extract(logPath, 'build.log'),
    time: Date.now(),
  };

  if (board === 'MDErgo1') {
    return {
      ...result,
      ...{
        type: 'split',
        bin: {
          left: await extract('left_' + binFile, undefined, true),
          right: await extract('right_' + binFile, undefined, true),
        },
      },
    };
  }
  return {
    ...result,
    ...{
      type: 'single',
      bin: await extract(binFile, undefined, true),
    },
  };
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
