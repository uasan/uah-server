import { host } from '../host.js';
import { BinaryData } from '../makers/types/validators/BinaryData.js';
import { Blob } from '../makers/types/validators/Blob.js';
import { File } from '../makers/types/validators/File.js';
import { printNode } from '../worker/printer.js';
import { addTransformer } from './ast.js';
import { factoryCallMethod } from './call.js';
import {
  getConstructIdentifier,
  getIndexTypeOfType,
  getPropertiesOfType,
  hasAnyType,
  isArrayLikeType,
  isBigIntType,
  isBooleanType,
  isNonPrimitiveType,
  isNumberType,
  isObjectType,
  isStringType,
  isTupleType,
  isTypeAsValues,
} from './checker.js';
import { factoryIdentifier, factoryNumber, factoryString, factoryTrue } from './expression.js';
import { ensureArgument, factoryArrowFunction, updateMethodStatements } from './function.js';
import { internals } from './internals.js';
import { getRefForLiteralTypes, getRefValue } from './refs.js';
import { factoryStatement } from './statements.js';
import { MetaType } from './types.js';

function makeValidateFunction(ast) {
  return getRefValue('_=>{' + printNode(ast) + '}');
}

function makeValidatorsByType(ast, meta, type = meta.type) {
  if (hasAnyType(type)) {
    return ast;
  }

  if (!isBooleanType(type) && isTypeAsValues(type)) {
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
  } else if (isBigIntType(type)) {
    ast = factoryCallMethod(ast, 'toBigInt');
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
      getIndexTypeOfType(type),
    );

    if (childAst === methodAst) {
      ast = factoryCallMethod(ast, 'isArray');
    } else {
      ast = factoryCallMethod(ast, 'forArray', [
        makeValidateFunction(methodAst),
      ]);
    }
  } else if (isObjectType(type)) {
    const ctor = meta.node && getConstructIdentifier(meta.node);

    if (ctor) {
      ast = factoryCallMethod(ast, 'toInstance', [ctor]);
    } else {
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
  }

  return ast;
}

function makeValidatorsByMeta(ast, meta) {
  if (meta.isConstruct) {
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

    addTransformer(node, node => {
      node = ensureArgument(node);

      if (initAst !== ast) {
        Object.assign(initAst, internals.setValidator(node.parameters[0].name));

        return updateMethodStatements(node, [
          factoryStatement(factoryCallMethod(ast, 'validate')),
          ...node.body.statements,
        ]);
      } else {
        return node;
      }
    });
  }

  return metaType;
}

export const makeFieldValidate = meta =>
  factoryArrowFunction(
    factoryIdentifier('_'),
    makeValidatorsByMeta(factoryIdentifier('_'), meta),
  );
