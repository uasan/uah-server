import { Int } from './Int.js';

export class Int8 extends Int {
  byteLength = 1;
  sqlType = 'smallint';
  numberType = 'Int8';
}
