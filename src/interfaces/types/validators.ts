type IntOptions =
  | {
      min?: number;
      max?: number;
      default?: number;
    }
  | undefined;

type TextOptions =
  | {
      max?: number;
      min?: number;
      length?: number;
      trim?: boolean;
      pattern?: RegExp;
      default?: string;
    }
  | undefined;

export type Default<T> = T;

export type Text<T extends TextOptions = undefined> = string;
export type Int<T extends IntOptions = undefined> = number;

export type Email = string;
export type UUID = string;
