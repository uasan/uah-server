import { Int } from './Int.js';

export class Int16 extends Int {
  static sqlType = 'smallint';

  byteLength = 2;
  numberType = 'Int16';
}
