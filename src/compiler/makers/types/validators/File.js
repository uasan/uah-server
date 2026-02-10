import { Validator } from '../validator.js';

export class File extends Validator {
  static make(meta) {
    meta.isFile = true;
    meta.isConstruct = true;
    meta.isBufferStream = true;

    if (meta.sql) {
      meta.sql.type = 'bytea';
    }
  }
}
