import { Int } from './Int.js';

export class Int8 extends Int {
  static sqlType = 'smallint';

  byteLength = 1;
  numberType = 'Int8';
}
