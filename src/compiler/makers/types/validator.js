import {
  getPropertiesOfTypeNode,
  getTypeOfSymbol,
  isTrueKeyword,
} from '../../helpers/checker.js';
import { getValueOfTypeNode } from '../../helpers/types.js';
import { factoryCallMethod } from '../../helpers/call.js';
import { host } from '../../host.js';

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
    if (typeNode) {
      for (const symbol of getPropertiesOfTypeNode(typeNode)) {
        const name = symbol.escapedName;
        const value = getValueOfTypeNode(symbol.valueDeclaration.type);

        if (value) {
          this.props.set(name, value);

          if (name === 'default') {
            context.defaultValue ??= value;
          }
        }
      }
    }

    return this;
  }

  make(ast, method = 'is' + this.constructor.name) {
    this.ast = factoryCallMethod(ast, method);
    return this.ast;
  }

  static make(context, args) {
    context.validators.add(new this().setProps(context, args?.[0]));
  }
}