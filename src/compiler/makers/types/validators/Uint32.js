import { Int } from './Int.js';

export class Uint32 extends Int {
  byteLength = 4;
  numberType = 'Uint32';

  static make(meta, args) {
    if (meta.sql) {
      meta.sql.length = 4;
      meta.sql.type = 'int';
    }

    super.make(meta, args);
  }
}
