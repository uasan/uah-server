import { webcrypto } from 'node:crypto';
import { Buffer } from 'node:buffer';

import { Unauthorized } from '../exceptions/Unauthorized.js';
import { UnProcessable } from '../exceptions/UnProcessable.js';
import { hasOwn } from '../types/checker.js';
import { decodeJSON } from '../types/json.js';

const { subtle } = webcrypto;
const keyUsages = ['verify'];

const ES256 = -7;
const PS256 = -37;
const RS256 = -257;

const algorithms = {
  [ES256]: {
    name: 'ECDSA',
    namedCurve: 'P-256',
    hash: { name: 'SHA-256' },
  },
  [PS256]: {
    name: 'RSA-PSS',
    hash: { name: 'SHA-256' },
  },
  [RS256]: {
    name: 'RSASSA-PKCS1-v1_5',
    hash: { name: 'SHA-256' },
  },
};

export class WebAuthn {
  data = null;
  json = null;
  signature = null;
  challenge = null;

  getAlgorithm(options) {
    if (hasOwn(algorithms, options.algorithm)) {
      return algorithms[options.algorithm];
    } else {
      throw new UnProcessable(`Unsupported algorithm "${options.algorithm}"`);
    }
  }

  async validate(options) {
    this.challenge = Buffer.from(
      decodeJSON(options.json).challenge,
      'base64url'
    );
  }

  async verify(options) {
    if (!options) {
      throw new Unauthorized();
    }

    const algorithm = this.getAlgorithm(options);
    const jsonHash = await subtle.digest(algorithm.hash.name, this.json);

    const signedData = new Uint8Array(
      this.data.byteLength + jsonHash.byteLength
    );

    signedData.set(new Uint8Array(this.data));
    signedData.set(new Uint8Array(jsonHash), this.data.byteLength);

    const verified = await subtle.verify(
      algorithm,
      await subtle.importKey('spki', options.key, algorithm, false, keyUsages),
      this.signature,
      signedData.buffer
    );

    if (verified !== true) {
      throw new Unauthorized();
    }
  }

  static async get(options) {
    const self = new this();

    self.data = options.data;
    self.json = options.json;
    self.signature = options.signature;

    return self;
  }
}
