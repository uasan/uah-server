import { Int } from './Int.js';

export class Uint16 extends Int {
  byteLength = 2;
  sqlType = 'smallint';
  numberType = 'Uint16';
}
