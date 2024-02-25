import { Validator } from '../Validator.js';

export class File extends Validator {
  sqlType = 'bytea';

  static make(meta) {
    meta.isFile = true;
    meta.isConstruct = true;
    meta.isTypeTrusted = true;
    meta.isBufferStream = true;
  }
}
