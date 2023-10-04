import { Int } from './Int.js';

export class Int16 extends Int {
  byteLength = 2;
  sqlType = 'smallint';
  numberType = 'Int16';
}
