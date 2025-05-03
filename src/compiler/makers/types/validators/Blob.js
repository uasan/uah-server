import { Validator } from '../Validator.js';

export class Blob extends Validator {
  static make(meta) {
    meta.isBlob = true;
    meta.isConstruct = true;
    meta.isBufferStream = true;

    if (meta.sql) {
      meta.sql.type = 'bytea';
    }
  }
}
