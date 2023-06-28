import { Validator } from '../validator.js';

export class Text extends Validator {
  make(ast) {
    super.make(ast, 'isString');

    if (this.isTrue('trim')) {
      this.makeCall('trimString');
    }

    if (this.props.has('length')) {
      this.makeCall('isTextLength', 'length');
    } else {
      if (this.props.has('min')) {
        this.makeCall('isTextMin', 'min');
      }

      if (this.props.has('max')) {
        this.makeCall('isTextMax', 'max');
      }
    }

    if (this.props.has('pattern')) {
      this.makeCall('isTextPattern', 'pattern');
    }

    return this.ast;
  }
}
