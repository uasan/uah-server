import { webcrypto } from 'node:crypto';
import { Unauthorized } from '../exceptions/Unauthorized.js';
import { UnProcessable } from '../exceptions/UnProcessable.js';

const { subtle } = webcrypto;

const keyUsages = ['verify'];
const algorithms = new Map().set(-7, {
  name: 'ECDSA',
  namedCurve: 'P-256',
  hash: { name: 'SHA-256' },
});

export class WebAuthn {
  constructor(options) {
    if (!options) {
      throw new Unauthorized();
    }

    if (algorithms.has(options.algorithm)) {
      this.algorithm = algorithms.get(options.algorithm);
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
  }
}
