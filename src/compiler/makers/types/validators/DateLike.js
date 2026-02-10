import { Validator } from '../validator.js';

export class DateLike extends Validator {
  static make(meta) {
    meta.isConstruct = true;

    if (meta.sql) {
      meta.sql.type = 'timestamptz';
    }
  }
}
