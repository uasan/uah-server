import { getValueOfTypeNode } from '../../../helpers/values.js';

export class Default {
  static make(context, args) {
    if (args?.[0]) {
      context.isOptional = true;
      context.defaultValue ??= getValueOfTypeNode(args[0]);
    }
  }
}
