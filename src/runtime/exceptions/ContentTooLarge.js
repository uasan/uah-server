import { Exception } from './Exception.js';

export class ContentTooLarge extends Exception {
  status = 413;

  constructor(maxByteLength) {
    super('Content too large');

    this.fields = { maxByteLength };
  }
}
