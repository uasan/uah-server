import { Int } from './Int.js';

export class Uint32 extends Int {
  byteLength = 4;
  sqlType = 'int';
  numberType = 'Uint32';
}
