import { Int } from './int.js';

export class Float extends Int {
  make(ast) {
    return super.make(ast, 'isNumber');
  }
}
