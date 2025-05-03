import { Int } from './Int.js';

export class Int32 extends Int {
  byteLength = 4;
  numberType = 'Int32';

  static make(meta) {
    if (meta.sql) {
      meta.sql.length = 4;
      meta.sql.type = 'int';
    }

    super.make(meta);
  }
}
