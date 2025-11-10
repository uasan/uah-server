export type BlobOptions =
  | {
      size?: number;
      minSize?: number;
      maxSize?: number;
      types?: string;
    }
  | undefined;

export type Blob<T extends BlobOptions = undefined> = globalThis.Blob;
