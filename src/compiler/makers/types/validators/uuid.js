import { Validator } from '../validator.js';

export class UUID extends Validator {
  static sqlType = 'uuid';
}
