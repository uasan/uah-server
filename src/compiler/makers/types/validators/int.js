import { Validator } from '../validator.js';

export class Int extends Validator {
  make(ast, method = 'isInt') {
    super.make(ast, method);

    if (this.props.has('min')) {
      this.makeCall('isMin', 'min');
    }

    if (this.props.has('max')) {
      this.makeCall('isMax', 'max');
    }

    return this.ast;
  }
}
