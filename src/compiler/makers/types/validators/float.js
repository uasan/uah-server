import { Int } from './Int.js';

export class Float extends Int {
  make(ast) {
    return super.make(ast, 'isNumber');
  }
}
