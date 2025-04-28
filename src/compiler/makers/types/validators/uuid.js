import { Validator } from '../Validator.js';

export class UUID extends Validator {
  static sqlType = 'uuid';

  static make(meta, args) {
    meta.isUUID = true;

    super.make(meta, args);
  }
}
