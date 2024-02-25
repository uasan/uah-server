import { Int } from './Int.js';

export class Uint8 extends Int {
  static sqlType = 'smallint';

  byteLength = 1;
  numberType = 'Uint8';
}
