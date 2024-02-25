import { Validator } from '../Validator.js';

export class TypedArray extends Validator {
  static make(meta) {
    meta.isConstruct = true;
  }
}
