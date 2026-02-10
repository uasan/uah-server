import { Validator } from '../validator.js';

export class Email extends Validator {
  static make(meta, args) {
    if (meta.sql) {
      meta.sql.type = 'text';
    }

    super.make(meta, args);
  }
}
