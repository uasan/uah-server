import { UnProcessable } from '../exceptions/UnProcessable.js';

export class ValidationErrors extends UnProcessable {
  static tooLong = 'tooLong';
  static tooShort = 'tooShort';
  static rangeUnderflow = 'rangeUnderflow';
  static rangeOverflow = 'rangeOverflow';
  static typeMismatch = 'typeMismatch';
  static valueMissing = 'valueMissing';
  static valueMismatch = 'valueMismatch';
  static patternMismatch = 'patternMismatch';

  constructor(errors) {
    super('Validation Errors');
    this.errors = errors;
  }
}
