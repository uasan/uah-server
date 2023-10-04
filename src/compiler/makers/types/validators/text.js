import { Validator } from '../Validator.js';

export class Text extends Validator {
  make(ast) {
    super.make(ast, 'isString');

    if (this.isTrue('digits')) {
      this.makeCall('toDigitsString');
    } else if (this.isTrue('trim')) {
      this.makeCall('trimString');
    }

    if (this.props.has('length')) {
      this.makeCall('isLength', 'length');
    } else {
      if (this.props.has('minLength')) {
        this.makeCall('isMinLength', 'min');
      }

      if (this.props.has('maxLength')) {
        this.makeCall('isMaxLength', 'max');
      }
    }

    if (this.isTrue('lowercase')) {
      this.makeCall('toLowerCase');
    } else if (this.isTrue('uppercase')) {
      this.makeCall('toUpperCase');
    }

    if (this.props.has('pattern')) {
      this.makeCall('isTextPattern', 'pattern');
    }

    return this.ast;
  }
}
