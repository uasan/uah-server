import { Validator } from '../validator.js';

export class TypedArray extends Validator {
  static make(meta) {
    meta.isConstruct = true;

    if (meta.sql) {
      meta.sql.type = 'bytea';
    }
  }
}
