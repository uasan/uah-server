import { Int } from './Int.js';

export class Uint8 extends Int {
  byteLength = 1;
  sqlType = 'smallint';
  numberType = 'Uint8';
}
