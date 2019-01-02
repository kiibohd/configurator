import fs from 'fs';
import path from 'path';
import Bluebird from 'bluebird';

const readdir = Bluebird.promisify(fs.readdir);
const stat = Bluebird.promisify(fs.stat);
const lstat = Bluebird.promisify(fs.lstat);
const unlink = Bluebird.promisify(fs.unlink);
const rmdir = Bluebird.promisify(fs.rmdir);

/**
 * @param {string} dirpath
 */
export async function rmrf(dirpath) {
  let files;
  try {
    files = await readdir(dirpath);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return;
    }
    throw e;
  }

  for (let i = 0; i < files.length; i++) {
    const filepath = path.join(dirpath, files[i]);
    const stat = await lstat(filepath);
    if (stat.isDirectory()) {
      await rmrf(filepath);
    } else {
      await unlink(filepath);
    }
  }

  await rmdir(dirpath);
}

/**
 * @param {string} dirpath
 */
export function rmrfSync(dirpath) {
  let files;
  try {
    files = fs.readdirSync(dirpath);
  } catch (e) {
    if (e.code === 'ENOENT') {
      return;
    }
    throw e;
  }

  for (let i = 0; i < files.length; i++) {
    const filepath = path.join(dirpath, files[i]);
    const stat = fs.lstatSync(filepath);
    if (stat.isDirectory()) {
      rmrfSync(filepath);
    } else {
      fs.unlinkSync(filepath);
    }
  }

  fs.rmdirSync(dirpath);
}

/**
 * @param {import('fs').PathLike} dir
 * @returns {Promise<boolean>}
 */
export async function directoryExists(dir) {
  try {
    const stats = await stat(dir);
    return stats.isDirectory();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    }
    throw e;
  }
}

/**
 * @param {import('fs').PathLike} dir
 * @returns {boolean}
 */
export function directoryExistsSync(dir) {
  try {
    const stats = fs.statSync(dir);
    return stats.isDirectory();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    }
    throw e;
  }
}
