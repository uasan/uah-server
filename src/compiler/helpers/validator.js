import { host } from '../host.js';
import { printNode } from '../worker/printer.js';
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
  hasAnyType,
  isTypeAsValues,
  hasNullType,
  getIndexTypeOfType,
  getNonNullableType,
  getNonUndefinedType,
  getPropertiesOfType,
  isNonPrimitiveType,
} from './checker.js';
import { factoryIdentifier, factoryString, factoryTrue } from './expression.js';
import { internals } from './internals.js';
import { getRefValue } from './refs.js';
import { factoryStatement } from './statements.js';
import { makeTypeContext, getRefForLiteralTypes } from './types.js';

function makeValidateFunction(ast) {
  return getRefValue('_=>{' + printNode(ast) + '}');
}

function makeValidatorsByType(ast, context, type) {
  if (hasAnyType(type)) {
    return ast;
  }

  //console.log(name, host.checker.typeToString(type), isTypeAsValues(type));

  if (isTypeAsValues(type)) {
    return factoryCallMethod(ast, 'inArray', [getRefForLiteralTypes(type)]);
  }

  if (hasNullType(type)) {
    type = getNonNullableType(type);
    ast = factoryCallMethod(ast, 'isNull');
  }

  if (context.validators.size) {
    for (const validator of context.validators) ast = validator.make(ast);
  } else if (isStringType(type)) {
    ast = factoryCallMethod(ast, 'isString');
  } else if (isNumberType(type)) {
    ast = factoryCallMethod(ast, 'isNumber');
  } else if (isBooleanType(type)) {
    ast = factoryCallMethod(ast, 'isBoolean');
  } else if (isNonPrimitiveType(type)) {
    ast = factoryCallMethod(ast, 'isObject');
  }

  if (isArrayLikeType(type)) {
    const childAst = factoryIdentifier('_');
    const methodAst = makeValidatorsByType(
      childAst,
      context.child,
      getIndexTypeOfType(type)
    );

    if (childAst === methodAst) {
      ast = factoryCallMethod(ast, 'isArray');
    } else {
      ast = factoryCallMethod(ast, 'forArray', [
        makeValidateFunction(methodAst),
      ]);
    }
  } else if (isObjectType(type)) {
    const symbols = getPropertiesOfType(type);

    if (symbols.length) {
      const childAst = factoryIdentifier('_');

      ast = factoryCallMethod(ast, 'forObject', [
        makeValidateFunction(makeValidatorsBySymbols(childAst, symbols)),
      ]);
    } else {
      ast = factoryCallMethod(ast, 'isObject');
    }
  }

  return ast;
}

function makeValidatorsBySymbols(ast, symbols) {
  for (const symbol of symbols) {
    let name = symbol.escapedName;
    let type = getTypeOfSymbol(symbol);
    let context = makeTypeContext(symbol.valueDeclaration.type);

    const params = [factoryString(name)];

    if (hasUndefinedType(type)) {
      type = getNonUndefinedType(type);

      params.push(factoryTrue());
      if (context.defaultValue) params.push(context.defaultValue);
    }

    ast = factoryCallMethod(ast, 'setKey', params);
    ast = makeValidatorsByType(ast, context, type);
  }

  return ast;
}

export function makePayloadValidator(node) {
  const { original = node } = node;

  const param = original.parameters[0];
  const type = getTypeOfNode(param);

  let ast = makeValidatorsBySymbols(
    internals.newValidator(param.name),
    getPropertiesOfType(type)
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
}
