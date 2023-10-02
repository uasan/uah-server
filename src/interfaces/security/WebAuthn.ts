interface InitOptions {
  key: ArrayBuffer;
  algorithm: number;
}

interface VerifyOptions {
  data: ArrayBuffer;
  json: ArrayBuffer;
  signature: ArrayBuffer;
}

export declare class WebAuthn {
  constructor(options: InitOptions);

  verify(options: VerifyOptions): Promise<void>;
}
