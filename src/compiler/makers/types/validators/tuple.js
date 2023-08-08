import { Validator } from '../validator.js';

export class Tuple extends Validator {
  make(ast) {
    super.make(ast, 'isArray');

    return this.ast;
  }
}
