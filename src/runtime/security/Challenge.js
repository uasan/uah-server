import { webcrypto } from 'node:crypto';

export class Challenge {
  static async create(ctx) {
    return ctx && webcrypto.getRandomValues(new Uint8Array(16));
  }
}
