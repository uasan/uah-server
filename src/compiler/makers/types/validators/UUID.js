import { Validator } from '../validator.js';

export class UUID extends Validator {
  static make(meta, args) {
    meta.isUUID = true;

    if (meta.sql) {
      meta.sql.type = 'uuid';
      meta.sql.length = 16;
    }

    super.make(meta, args);
  }
}
