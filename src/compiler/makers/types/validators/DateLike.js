import { Validator } from '../Validator.js';

export class DateLike extends Validator {
  static sqlType = 'timestamptz';

  static make(meta) {
    meta.isConstruct = true;
  }
}
