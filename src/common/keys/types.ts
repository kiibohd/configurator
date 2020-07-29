export interface LocalizedKey {
  iec: string;
  key: string;
  label1: string;
  label2: string;
  label3: string;
}

export interface Locale {
  keys: LocalizedKey[];
  code2iec: SparseArray<string>;
  iec2key: Dictionary<LocalizedKey>;
  keyname2key: Dictionary<LocalizedKey>;
}

export interface PredefinedKey {
  name: string;
  label: string;
  aliases: string[];
  triggerDef: number;
  resultDef: number;
  group?: string;
  order: number;
  // TODO: Convert to CSS object
  style: Record<string, unknown>;
  // TODO: constrain type
  data?: CustomKey | Record<string, unknown>;
}

export interface BaseKey {
  key: string;
  label1: string;
}

export interface DisplayKey extends BaseKey {
  key: string;
  label1: string;
  label2?: string;
  label3?: string;
  // TODO: Convert to CSS object
  style: Record<string, unknown>;
  custom?: string;
  // TODO: constrain type
  data?: CustomKey | Record<string, unknown>;
}

export interface CustomKey extends BaseKey {
  key: string;
  label1: string;
  custom: string;
  // TODO: Convert to CSS object
  style?: Record<string, unknown>;
  data?: Record<string, unknown>;
}
