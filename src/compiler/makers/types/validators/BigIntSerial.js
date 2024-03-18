import { Validator } from '../Validator.js';

export class BigIntSerial extends Validator {
  static sqlType = 'bigserial';

  make(ast) {
    return super.make(ast, 'toBigInt');
  }

  static make(meta, args) {
    meta.sqlType = meta.isRefType ? 'bigint' : this.sqlType;

    super.make(meta, args);
  }
}
