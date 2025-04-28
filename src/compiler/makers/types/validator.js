import { factoryCallMethod } from '../../helpers/call.js';
import { getPropertiesOfTypeNode, isDefiniteType, isTrueKeyword } from '../../helpers/checker.js';
import { getValueOfTypeNode } from '../../helpers/values.js';
import { host } from '../../host.js';

export class Validator {
  ast = null;
  meta = null;
  props = new Map();

  static type = null;
  static symbol = null;

  static sqlType = '';

  isTrue(key) {
    return this.props.has(key) && isTrueKeyword(this.props.get(key));
  }

  makeCall(method, key) {
    this.ast = key
      ? factoryCallMethod(this.ast, method, [this.props.get(key)])
      : factoryCallMethod(this.ast, method);
  }

  setProps(meta, typeNode) {
    this.meta = meta;

    if (typeNode) {
      for (const symbol of getPropertiesOfTypeNode(typeNode)) {
        const name = symbol.escapedName;
        const value = getValueOfTypeNode(symbol.valueDeclaration.type);

        if (value) {
          this.props.set(name, value);

          switch (name) {
            case 'default':
              meta.defaultValue ??= value;
              break;
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

  static make(meta, args) {
    meta.sqlType ||= this.sqlType;

    meta.validators.add(new this().setProps(meta, args?.[0]));
  }

  static isAssignable(type) {
    return (
      host.checker.isTypeAssignableTo(type, this.type) && isDefiniteType(type)
    );
  }
}
