import ts from 'typescript';
import { typeNames } from '../makers/declaration.js';
import { host } from '../host.js';
import { factoryElementAccess, factoryPropertyAccess } from './object.js';
import {
  factoryIdentifier,
  factoryNumber,
  factoryString,
} from './expression.js';

const {
  LiteralType,
  QualifiedName,
  TypeReference,
  StringLiteral,
  NumericLiteral,
  IndexedAccessType,
} = ts.SyntaxKind;

const isTypeName = ({ typeName }) => !!typeName;

export const getTypeNameOfSymbol = ({ valueDeclaration: { type } }) =>
  type.typeName ?? type.types.find(isTypeName).typeName;

export function getLiteralValue(node) {
  switch (node.kind) {
    case StringLiteral:
    case NumericLiteral:
      return node;
  }

  const value = host.checker.getConstantValue(node.parent);

  switch (typeof value) {
    case 'string':
      return factoryString(value);
    case 'number':
      return factoryNumber(value);
  }

  return node;
}

function toPropertyAccess(node) {
  switch (node.kind) {
    case TypeReference:
      return toPropertyAccess(node.typeName);

    case QualifiedName:
      return factoryPropertyAccess(node.left, node.right);

    case IndexedAccessType:
      const name = node.indexType.literal;
      const expression = toPropertyAccess(node.objectType);

      return name.kind === NumericLiteral
        ? factoryElementAccess(expression, name)
        : factoryPropertyAccess(expression, factoryIdentifier(name.text));

    default:
      return node;
  }
}

function getValueOfType(node) {
  switch (node.kind) {
    case LiteralType:
      return node.literal;
    case TypeReference:
      //console.log(host.checker.getConstantValue(typeNode));
      return toPropertyAccess(node.typeName);

    case IndexedAccessType:
      return toPropertyAccess(node);
  }
}

function findDefaultValue(types) {
  for (const type of types)
    if (typeNames.Default.is(type.typeName))
      return getValueOfType(type.typeArguments[0]);
}

export function getMetaType(symbol) {
  const { type } = symbol.valueDeclaration;

  return {
    validators: null,
    defaultValue: type.types ? findDefaultValue(type.types) : null,
  };
}
