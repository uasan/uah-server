import { Int } from './Int.js';

export class Int32 extends Int {
  static sqlType = 'int';

  byteLength = 4;
  numberType = 'Int32';
}
