import { Validator } from '../Validator.js';

export class BinaryData extends Validator {
  static make(meta) {
    if (meta.sql) {
      meta.sql.type = 'bytea';
    }
  }
}
