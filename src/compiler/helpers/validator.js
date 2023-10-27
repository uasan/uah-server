import { host } from '../host.js';
import { File } from '../makers/types/validators/File.js';
import { Blob } from '../makers/types/validators/Blob.js';
import { BinaryData } from '../makers/types/validators/BinaryData.js';
import { printNode } from '../worker/printer.js';
import { addTransformer } from './ast.js';
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
import { getRefValue, getRefForLiteralTypes } from './refs.js';
import { factoryStatement } from './statements.js';
import { MetaType } from './types.js';

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
        makeValidateFunction(makeValidatorsBySymbols(childAst, [...symbols])),
      ]);
    } else {
      ast = factoryCallMethod(ast, 'isObject');
    }
  }

  return ast;
}

function makeValidatorsByMeta(ast, meta) {
  if (meta.isBinary) {
    return ast;
  }

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
  let i = 0;

  for (const symbol of symbols) {
    symbols[i] = MetaType.create(symbol.valueDeclaration);
    ast = makeValidatorsByMeta(ast, symbols[i]);
    i++;
  }

  return ast;
}

export function makePayloadValidator(node, type) {
  const metaType = {
    type,
    props: [],
    isFile: false,
    isBlob: false,
    isBufferStream: false,
    isBinary: BinaryData.isAssignable(type),
  };

  if (metaType.isBinary) {
    if (File.isAssignable(type)) {
      metaType.isFile = true;
      metaType.isBufferStream = true;
    } else if (Blob.isAssignable(type)) {
      metaType.isBlob = true;
      metaType.isBufferStream = true;
    }
  } else {
    metaType.props.push(...getPropertiesOfType(type));

    let initAst = host.factory.createIdentifier('_');
    let ast = makeValidatorsBySymbols(initAst, metaType.props);

    if (initAst !== ast) {
      addTransformer(node, node => {
        node = ensureArgument(node);
        Object.assign(initAst, internals.newValidator(node.parameters[0].name));

        return updateMethodStatements(node, [
          factoryStatement(factoryCallMethod(ast, 'validate')),
          ...node.body.statements,
        ]);
      });
    }
  }

  return metaType;
}

export const makeFieldValidate = meta =>
  factoryArrowFunction(
    factoryIdentifier('_'),
    makeValidatorsByMeta(factoryIdentifier('_'), meta)
  );
