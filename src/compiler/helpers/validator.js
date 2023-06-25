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
  isEnumType,
  hasOnlyUnitsType,
  getOriginSymbol,
  getOriginSymbolOfNode,
  hasNullType,
} from './checker.js';
import { factoryString, factoryTrue } from './expression.js';
import { internals } from './internals.js';
import { factoryStatement } from './statements.js';
import { getMetaType, getTypeNameOfSymbol } from './types.js';

function makeValidations(ast, symbols) {
  for (const symbol of symbols) {
    let name = symbol.escapedName;
    let meta = getMetaType(symbol);
    let type = getTypeOfSymbol(symbol);

    const params = [factoryString(name)];
    const isNullable = hasNullType(type);

    if (hasUndefinedType(type)) {
      type = getNonNullableType(type);

      params.push(factoryTrue());
      if (meta.defaultValue) params.push(meta.defaultValue);
    }

    ast = factoryCallMethod(ast, 'setKey', params);

    if (hasAnyType(type)) {
      continue;
    }

    if (isNullable) {
      ast = factoryCallMethod(ast, 'checkNull');
    }

    if (types.has(getOriginSymbol(symbol.valueDeclaration.type))) {
      console.log(name, types.has(symbol.valueDeclaration.type));
      //
    } else if (isStringType(type)) {
      ast = factoryCallMethod(ast, 'checkString');
    } else if (isNumberType(type)) {
      ast = factoryCallMethod(ast, 'checkNumber');
    } else if (isBooleanType(type)) {
      ast = factoryCallMethod(ast, 'checkBoolean');
    } else if (isEnumType(type)) {
      ast = factoryCallMethod(ast, 'checkEnum', [getTypeNameOfSymbol(symbol)]);
    } else if (hasOnlyUnitsType(type)) {
      //console.log(symbol.valueDeclaration.type);
      ast = factoryCallMethod(ast, 'checkUnit');
    } else if (isArrayLikeType(type)) {
      ast = factoryCallMethod(ast, 'checkArray');
    } else if (isObjectType(type)) {
      ast = factoryCallMethod(ast, 'checkObject');
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
