import { Validator } from '../validator.js';

export class Int extends Validator {
  make(ast) {
    super.make(ast);

    if (this.props.has('min')) {
      this.makeCall('isIntMin', 'min');
    }

    if (this.props.has('max')) {
      this.makeCall('isIntMax', 'max');
    }

    return this.ast;
  }
}
