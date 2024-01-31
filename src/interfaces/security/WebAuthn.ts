interface CreatorOptions {
  json: ArrayBuffer;
}

interface GetterOptions {
  data: ArrayBuffer;
  json: ArrayBuffer;
  signature: ArrayBuffer;
}

interface VerifyOptions {
  key: ArrayBuffer;
  algorithm: number;
}

export declare class WebAuthn {
  challenge: Uint8Array;

  verify(options: VerifyOptions): Promise<void>;

  static create(options: CreatorOptions): Promise<WebAuthn>;
  static get(options: GetterOptions): Promise<WebAuthn>;
}
