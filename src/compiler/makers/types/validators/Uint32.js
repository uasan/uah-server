import { Int } from './Int.js';

export class Uint32 extends Int {
  static sqlType = 'int';

  byteLength = 4;
  numberType = 'Uint32';
}
