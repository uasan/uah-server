import { Int } from './Int.js';

export class Uint16 extends Int {
  static sqlType = 'smallint';

  byteLength = 2;
  numberType = 'Uint16';
}
