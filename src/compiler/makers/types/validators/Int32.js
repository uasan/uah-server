import { Int } from './Int.js';

export class Int32 extends Int {
  byteLength = 4;
  sqlType = 'int';
  numberType = 'Int32';
}
