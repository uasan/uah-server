import type { Blob } from './Blob.ts';
import type { File } from './File.ts';

type NumberOptions =
  | {
    min?: number;
    max?: number;
    default?: number;
  }
  | undefined;

type ArrayOptions =
  | {
    length?: number;
    minLength?: number;
    maxLength?: number;
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
    length?: number;
    minLength?: number;
    maxLength?: number;
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
export type Email = string;
export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type BigIntSerial = bigint;

export type Int<T extends NumberOptions = undefined> = number;
export type Int8<T extends NumberOptions = undefined> = number;
export type Int16<T extends NumberOptions = undefined> = number;
export type Int32<T extends NumberOptions = undefined> = number;
export type Uint<T extends NumberOptions = undefined> = number;
export type Uint8<T extends NumberOptions = undefined> = number;
export type Uint16<T extends NumberOptions = undefined> = number;
export type Uint32<T extends NumberOptions = undefined> = number;

export type Float<T extends NumberOptions = undefined> = number;
export type Float32<T extends NumberOptions = undefined> = number;

export type ArrayBuffer<T extends ArrayBufferOptions = undefined> =
  globalThis.ArrayBuffer;

export type DataView<T extends ArrayBufferOptions = undefined> =
  globalThis.DataView;

export type Uint8Array<T extends ArrayOptions = undefined> =
  globalThis.Uint8Array;

export type TypedArray =
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | BigUint64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | BigInt64Array
  | Float32Array
  | Float64Array;

export type BinaryData = ArrayBuffer | TypedArray | DataView | Blob | File;

export type DateLike = Date;
