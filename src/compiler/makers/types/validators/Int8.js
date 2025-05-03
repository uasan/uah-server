import { Int } from './Int.js';

export class Int8 extends Int {
  byteLength = 1;
  numberType = 'Int8';

  static make(meta) {
    if (meta.sql) {
      meta.sql.length = 2;
      meta.sql.type = 'smallint';
    }

    super.make(meta);
  }
}
