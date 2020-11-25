import { PersistedCannedAnimation, PersistedConfig } from '../config';
import { KeyboardFamily, Keyboard, KeyDetails, Layout, Variant } from './common';

import fs from 'fs';
import path from 'path';
import Bluebird from 'bluebird';

const readFile = Bluebird.promisify(fs.readFile);

interface KeyboardSetJson {
  keyboards: string[];
  image: ImageJson;
}

interface ImageJson {
  file: string;
  width: number;
  height: number;
}

interface KeyboardJson {
  keyboard: string;
  display: string;
  image: ImageJson;
  aliases: string[];
  variants: VariantJson[];
}

interface VariantJson {
  name: string;
  display: string;
  identities: DeviceIdentifierJson[];
  isSplit: boolean;
  resetCombo: string;
  visuals: 'none' | 'single-color' | 'rgb';
  physical: PhysicalLayoutJson;
  layouts: LayoutJson[];
  animations: {
    canned?: Dictionary<PersistedCannedAnimation>;
  };
}

interface DeviceIdentifierJson {
  vid: string;
  pid: string;
  flash: boolean;
}

interface PhysicalLayoutJson {
  rows: number[];
  keys: string[];
}

interface LayoutJson {
  name: string;
  display: string;
  file: string;
}

async function readJson<T>(filepath: string): Promise<T> {
  const buffer = await readFile(filepath);
  return JSON.parse(buffer.toString('utf8')) as T;
}

async function readImageToBase64(filepath: string): Promise<string> {
  const buffer = await readFile(filepath);
  return buffer.toString('base64');
}

function row(value: string): KeyDetails[] {
  const keys: KeyDetails[] = [];
  const defs = value.split(' ');

  for (let i = 0, left = 0; i < defs.length; i++) {
    const def = defs[i];
    if (!def.length) continue;
    const key = {
      size: parseFloat(def),
      left,
      isSpace: def.includes('s'),
      isDifference: def.includes('d'),
      isVertical: def.includes('v'),
    };
    keys.push(key);
    left += key.size;
  }

  return keys;
}

export async function loadFromFile(file: string): Promise<KeyboardFamily> {
  const dir = path.dirname(file);
  const config = await readJson<KeyboardSetJson>(file);
  const keyboards: Keyboard[] = [];

  for (const keyboard of config.keyboards) {
    const keyconfig = await readJson<KeyboardJson>(path.join(dir, keyboard, 'config.json'));

    const variants: Variant[] = [];

    for (const variant of keyconfig.variants) {
      const layouts: Layout[] = [];

      for (const layout of variant.layouts) {
        const layoutConfig = await readJson<PersistedConfig>(path.join(dir, keyboard, layout.file));

        layouts.push({
          name: layout.name,
          display: layout.display,
          config: layoutConfig,
        });
      }

      variants.push({
        name: variant.name,
        display: variant.display,
        identities: variant.identities.map((x) => ({
          flash: x.flash,
          pid: parseInt(x.pid),
          vid: parseInt(x.vid),
        })),
        isSplit: variant.isSplit,
        resetCombo: variant.resetCombo,
        visuals: variant.visuals,
        physical: {
          rows: variant.physical.rows,
          keys: variant.physical.keys.map(row),
        },
        layouts,
        animations: variant.animations,
      });
    }

    const imgData = await readImageToBase64(path.join(dir, keyboard, keyconfig.image.file));

    keyboards.push({
      keyboard: keyconfig.keyboard,
      display: keyconfig.display,
      image: {
        data: imgData,
        width: keyconfig.image.width,
        height: keyconfig.image.height,
      },
      aliases: keyconfig.aliases,
      variants,
    });
  }

  const imgData = await readImageToBase64(path.join(dir, config.image.file));

  return {
    image: {
      data: imgData,
      width: config.image.width,
      height: config.image.height,
    },
    keyboards,
  };
}
