type NumberOptions =
  | {
    min?: number;
    max?: number;
    default?: number;
  }
  | undefined;

type ArrayBufferOptions =
  | {
    byteLength?: number;
    minByteLength?: number;
    maxByteLength?: number;
  }
  | undefined;

type TextOptions =
  | {
    max?: number;
    min?: number;
    length?: number;
    trim?: boolean;
    digits?: boolean;
    pattern?: RegExp;
    default?: string;
    lowercase?: boolean;
    uppercase?: boolean;
  }
  | undefined;

export type Default<T> = T;

export type Text<T extends TextOptions = undefined> = string;
export type Int<T extends NumberOptions = undefined> = number;
export type Float<T extends NumberOptions = undefined> = number;

export type Email = string;
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

export type Blob<T extends ArrayBufferOptions = undefined> = globalThis.Blob;
//export type File<T extends ArrayBufferOptions = undefined> = globalThis.File;

export type ArrayBuffer<T extends ArrayBufferOptions = undefined> =
  globalThis.ArrayBuffer;

export type Uint8Array<T extends ArrayBufferOptions = undefined> =
  globalThis.Uint8Array;
