import { Float } from './Float.js';

export class Float32 extends Float {
  byteLength = 4;
  numberType = 'Float32';

  static make(meta, args) {
    if (meta.sql) {
      meta.sql.length = 4;
      meta.sql.type = 'float4';
    }

    super.make(meta, args);
  }
}
