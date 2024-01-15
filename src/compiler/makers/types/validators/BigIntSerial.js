import { Validator } from '../Validator.js';

export class BigIntSerial extends Validator {
  static sqlType = 'bigserial';

  make(ast) {
    return super.make(ast, 'isBigInt');
  }
}
