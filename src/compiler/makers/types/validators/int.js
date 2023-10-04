import { Validator } from '../Validator.js';

export class Int extends Validator {
  byteLength = 4;
  sqlType = 'int';
  numberType = 'Int32';

  make(ast, method = 'isInt') {
    super.make(ast, method);

    this.meta.sqlType = this.sqlType;
    this.meta.bytelength = this.bytelength;
    this.meta.numberType = this.numberType;

    if (this.props.has('min')) {
      this.makeCall('isMin', 'min');
    }

    if (this.props.has('max')) {
      this.makeCall('isMax', 'max');
    }

    return this.ast;
  }
}
