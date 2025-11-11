import { Int } from './Int.js';

export class Uint8 extends Int {
  byteLength = 1;
  numberType = 'Uint8';

  static make(meta, args) {
    if (meta.sql) {
      meta.sql.length = 2;
      meta.sql.type = 'smallint';
    }

    super.make(meta, args);
  }
}
