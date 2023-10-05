import { Int } from './Int.js';

export class Float extends Int {
  byteLength = 8;
  sqlType = 'float';
  numberType = 'Float64';

  make(ast) {
    return super.make(ast, 'isNumber');
  }
}
