import { webcrypto } from 'node:crypto';
import { Unauthorized } from '../exceptions/Unauthorized.js';
import { UnProcessable } from '../exceptions/UnProcessable.js';
import { hasOwn } from '../types/checker.js';

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
  constructor(options) {
    if (!options) {
      throw new Unauthorized();
    }

    if (hasOwn(algorithms, options.algorithm)) {
      this.algorithm = algorithms[options.algorithm];
    } else {
      throw new UnProcessable(`Unsupported algorithm "${options.algorithm}"`);
    }

    this.key = options.key;
  }

  async getCryptoKey() {
    return await subtle.importKey(
      'spki',
      this.key,
      this.algorithm,
      false,
      keyUsages
    );
  }

  async verify(options) {
    const jsonHash = new Uint8Array(
      await subtle.digest(this.algorithm.hash.name, options.json)
    );

    const signedData = new Uint8Array(
      options.data.byteLength + jsonHash.byteLength
    );

    signedData.set(new Uint8Array(options.data));
    signedData.set(jsonHash, options.data.byteLength);

    const verified = await subtle.verify(
      this.algorithm,
      await this.getCryptoKey(),
      options.signature,
      signedData.buffer
    );

    if (verified === false) {
      throw new Unauthorized();
    }

    console.log({ verified });
  }
}
