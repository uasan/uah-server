interface CreatorOptions {
  json: Uint8Array;
}

interface GetterOptions {
  data: Uint8Array;
  json: Uint8Array;
  signature: Uint8Array;
}

interface VerifyOptions {
  key: Uint8Array;
  algorithm: number;
}

export declare class WebAuthn {
  challenge: Uint8Array;

  verify(options: VerifyOptions): Promise<void>;

  static create(options: CreatorOptions): Promise<WebAuthn>;
  static get(options: GetterOptions): Promise<WebAuthn>;
}
