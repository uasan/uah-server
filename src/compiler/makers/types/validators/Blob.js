import { Validator } from '../Validator.js';

export class Blob extends Validator {
  sqlType = 'bytea';

  static make(meta) {
    meta.isBlob = true;
    meta.isConstruct = true;
    meta.isBufferStream = true;
  }
}
