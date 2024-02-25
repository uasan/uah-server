import { Validator } from '../Validator.js';

export class Int extends Validator {
  static sqlType = 'int';

  byteLength = 4;
  numberType = 'Int32';

  make(ast, method = 'isInt') {
    super.make(ast, method);

    //this.meta.sqlType = this.sqlType;
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
