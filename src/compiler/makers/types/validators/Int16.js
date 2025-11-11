import { Int } from './Int.js';

export class Int16 extends Int {
  byteLength = 2;
  numberType = 'Int16';

  static make(meta, args) {
    if (meta.sql) {
      meta.sql.length = 2;
      meta.sql.type = 'smallint';
    }

    super.make(meta, args);
  }
}
