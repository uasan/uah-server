import { webcrypto } from 'node:crypto';
import { decodeJSON } from '../types/json.js';

export class Challenge {
  static async create(ctx) {
    return ctx && webcrypto.getRandomValues(new Uint8Array(16));
  }

  static async verifyFromJSON(ctx, json) {
    console.log(decodeJSON(json).challenge);
  }
}
