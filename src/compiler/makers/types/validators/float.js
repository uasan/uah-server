import { Int } from './Int.js';

export class Float extends Int {
  byteLength = 8;
  numberType = 'Float64';

  make(ast) {
    return super.make(ast, 'isNumber');
  }

  static make(meta) {
    if (meta.sql) {
      meta.sql.length = 8;
      meta.sql.type = 'float8';
    }

    super.make(meta);
  }
}
