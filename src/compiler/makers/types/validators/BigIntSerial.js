import { Validator } from '../Validator.js';

export class BigIntSerial extends Validator {
  make(ast) {
    return super.make(ast, 'toBigInt');
  }

  static make(meta, args) {
    if (meta.sql) {
      meta.sql.length = 8;
      meta.sql.type = meta.isRefType ? 'bigint' : 'bigserial';
    }

    super.make(meta, args);
  }
}
