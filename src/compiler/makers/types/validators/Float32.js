import { Float } from './Float.js';

export class Float32 extends Float {
  byteLength = 4;
  sqlType = 'float4';
  numberType = 'Float32';
}
