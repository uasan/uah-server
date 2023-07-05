import { getValueOfTypeNode } from '../../../helpers/types.js';

export class Default {
  static make(context, args) {
    if (args?.[0]) {
      context.defaultValue ??= getValueOfTypeNode(args[0]);
    }
  }
}
