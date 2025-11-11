import { Validator } from '../Validator.js';

export class Int extends Validator {
  byteLength = 4;
  numberType = 'Int32';

  make(ast, method = 'isInt') {
    super.make(ast, method);

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

  static make(meta, args) {
    if (meta.sql) {
      meta.sql.length = 4;
      meta.sql.type = 'int';
    }

    super.make(meta, args);
  }
}
