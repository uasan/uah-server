import { host, types } from '../host.js';
import { factoryCallMethod } from './call.js';
import {
  getTypeOfNode,
  getTypeOfSymbol,
  hasUndefinedType,
  isArrayLikeType,
  isBooleanType,
  isNumberType,
  isObjectType,
  isStringType,
  getNonNullableType,
  hasAnyType,
  isOnlyLiteralTypes,
  hasNullType,
} from './checker.js';
import { factoryString, factoryTrue } from './expression.js';
import { internals } from './internals.js';
import { factoryStatement } from './statements.js';
import { makeTypeContext, getRefForLiteralTypes } from './types.js';

function makeValidations(ast, symbols) {
  for (const symbol of symbols) {
    let name = symbol.escapedName;
    let meta = makeTypeContext(symbol);
    let type = getTypeOfSymbol(symbol);

    const params = [factoryString(name)];
    const isNullable = hasNullType(type);

    if (hasUndefinedType(type)) {
      type = getNonNullableType(type);

      params.push(factoryTrue());
      if (meta.defaultValue) params.push(meta.defaultValue);
    }

    //console.log(name, type.isUnion());
    ast = factoryCallMethod(ast, 'setKey', params);

    if (hasAnyType(type)) {
      continue;
    }

    if (isNullable) {
      ast = factoryCallMethod(ast, 'setNullable');
    }

    if (isOnlyLiteralTypes(type)) {
      ast = factoryCallMethod(ast, 'inArray', [getRefForLiteralTypes(type)]);
    } else if (meta.validators.size) {
      for (const validator of meta.validators.values())
        ast = validator.make(ast);
    } else if (isStringType(type)) {
      ast = factoryCallMethod(ast, 'isString');
    } else if (isNumberType(type)) {
      ast = factoryCallMethod(ast, 'isNumber');
    } else if (isBooleanType(type)) {
      ast = factoryCallMethod(ast, 'isBoolean');
    } else if (isArrayLikeType(type)) {
      ast = factoryCallMethod(ast, 'isArray');
    } else if (isObjectType(type)) {
      ast = factoryCallMethod(ast, 'isObject');
    }
  }

  return ast;
}

export const payloadValidator = {
  transform(node) {
    const { original = node } = node;

    const param = original.parameters[0];
    const type = getTypeOfNode(param);

    let ast = makeValidations(
      internals.newValidator(param.name),
      type.getApparentProperties()
    );

    ast = factoryCallMethod(ast, 'validate');

    //console.info(ast);

    return host.factory.updateMethodDeclaration(
      node,
      node.modifiers,
      undefined,
      node.name,
      undefined,
      undefined,
      node.parameters,
      undefined,
      host.factory.updateBlock(node.body, [
        factoryStatement(ast),
        ...node.body.statements,
      ])
    );
  },
};
