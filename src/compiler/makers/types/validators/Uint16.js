import { Int } from './Int.js';

export class Uint16 extends Int {
  byteLength = 2;
  numberType = 'Uint16';

  static make(meta) {
    if (meta.sql) {
      meta.sql.length = 2;
      meta.sql.type = 'smallint';
    }

    super.make(meta);
  }
}
