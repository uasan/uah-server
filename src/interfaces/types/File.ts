import type { BlobOptions } from './Blob.ts';



export declare class File<
  T extends BlobOptions = undefined,
> extends globalThis.Blob {
  name: string;
  path: string;
  hash: string;

  size: number;
  lastModified: number;

  //ReadableStream
  constructor(path: string, type?: string);
  save(path?: string): Promise<string>;
  move(path: string): Promise<string>;
}
