import { Validator } from '../Validator.js';

export class IntSerial extends Validator {
  make(ast) {
    return super.make(ast, 'toInt');
  }

  static make(meta, args) {
    if (meta.sql) {
      meta.sql.length = 4;
      meta.sql.type = meta.isRefType ? 'int' : 'serial';
    }

    super.make(meta, args);
  }
}
