import { printNode } from '../worker/printer.js';
import { factoryCallMethod } from './call.js';
import {
  isArrayLikeType,
  isBooleanType,
  isNumberType,
  isObjectType,
  isStringType,
  hasAnyType,
  isTypeAsValues,
  getIndexTypeOfType,
  getPropertiesOfType,
  isNonPrimitiveType,
  isTupleType,
} from './checker.js';
import {
  factoryIdentifier,
  factoryNumber,
  factoryString,
  factoryTrue,
} from './expression.js';
import {
  ensureArgument,
  factoryArrowFunction,
  updateMethodStatements,
} from './function.js';
import { internals } from './internals.js';
import { getRefValue } from './refs.js';
import { factoryStatement } from './statements.js';
import { getRefForLiteralTypes, MetaType } from './types.js';

function makeValidateFunction(ast) {
  return getRefValue('_=>{' + printNode(ast) + '}');
}

function makeValidatorsByType(ast, meta, type = meta.type) {
  if (hasAnyType(type)) {
    return ast;
  }

  //console.log(name, host.checker.typeToString(type), isTypeAsValues(type));

  if (isTypeAsValues(type)) {
    return factoryCallMethod(ast, 'inArray', [getRefForLiteralTypes(type)]);
  }

  if (meta.isNullable) {
    ast = factoryCallMethod(ast, 'isNull');
  }

  if (meta.validators.size) {
    for (const validator of meta.validators) ast = validator.make(ast);
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
    if (isTupleType(type)) {
      const { minLength, fixedLength, hasRestElement } = type.target;

      ast = hasRestElement
        ? factoryCallMethod(ast, 'isMinLength', [factoryNumber(minLength)])
        : factoryCallMethod(ast, 'isLength', [factoryNumber(fixedLength)]);
    }

    const childAst = factoryIdentifier('_');
    const methodAst = makeValidatorsByType(
      childAst,
      meta.children[0],
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

function makeValidatorsByMeta(ast, meta) {
  const params = [factoryString(meta.name)];

  if (meta.isOptional) {
    params.push(factoryTrue());

    if (meta.defaultValue) {
      params.push(meta.defaultValue);
    }
  }

  return makeValidatorsByType(factoryCallMethod(ast, 'setKey', params), meta);
}

function makeValidatorsBySymbols(ast, symbols) {
  for (const symbol of symbols)
    ast = makeValidatorsByMeta(ast, MetaType.create(symbol.valueDeclaration));

  return ast;
}

export function makePayloadValidator(node, type) {
  node = ensureArgument(node);

  const param = node.parameters[0];

  let ast = makeValidatorsBySymbols(
    internals.newValidator(param.name),
    getPropertiesOfType(type)
  );

  ast = factoryCallMethod(ast, 'validate');

  return updateMethodStatements(node, [
    factoryStatement(ast),
    ...node.body.statements,
  ]);
}

export const makeFieldValidate = meta =>
  factoryArrowFunction(
    factoryIdentifier('_'),
    makeValidatorsByMeta(factoryIdentifier('_'), meta)
  );
