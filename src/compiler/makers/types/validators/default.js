import { Validator } from '../validator.js';
import { getValueOfType } from '../../../helpers/types.js';

export class Default extends Validator {
  static make(context, args) {
    if (args?.[0]) {
      context.defaultValue ??= getValueOfType(args?.[0]);
    }
  }
}
