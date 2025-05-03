import { getValueOfLiteral } from '#compiler/helpers/values.js';
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

      if (this.meta.sql) {
        const length = getValueOfLiteral(this.props.get('length'));

        if (length > 0) {
          this.meta.sql.type = length === 1 ? '"char"' : `char(${length})`;
        }
      }
    } else {
      if (this.props.has('minLength')) {
        this.makeCall('isMinLength', 'minLength');
      }

      if (this.props.has('maxLength')) {
        this.makeCall('isMaxLength', 'maxLength');

        if (this.meta.sql) {
          const length = getValueOfLiteral(this.props.get('maxLength'));

          if (length > 0) {
            this.meta.sql.type = `varchar(${length})`;
          }
        }
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

  static make(meta) {
    if (meta.sql) {
      meta.sql.type = 'text';
    }

    super.make(meta);
  }
}
