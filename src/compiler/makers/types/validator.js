import { isTrueKeyword } from '../../helpers/checker.js';
import { getValueOfType } from '../../helpers/types.js';
import { factoryCallMethod } from '../../helpers/call.js';

export class Validator {
  ast = null;
  props = new Map();

  isTrue(key) {
    return this.props.has(key) && isTrueKeyword(this.props.get(key));
  }

  makeCall(method, key) {
    this.ast = key
      ? factoryCallMethod(this.ast, method, [this.props.get(key)])
      : factoryCallMethod(this.ast, method);
  }

  setProps(context, typeNode) {
    if (typeNode)
      for (const member of typeNode.members) {
        const name = member.name.escapedText;
        const value = getValueOfType(member.type);

        if (name === 'default') {
          context.defaultValue ??= value;
        } else {
          this.props.set(name, value);
        }
      }

    return this;
  }

  make(ast, method = 'is' + this.constructor.name) {
    this.ast = factoryCallMethod(ast, method);
    return this.ast;
  }

  static make(context, args) {
    const typeNode = args?.[0];

    if (context.validators.has(this)) {
      context.validators.get(this).setProps(context, typeNode);
    } else {
      context.validators.set(this, new this().setProps(context, typeNode));
    }
  }
}
