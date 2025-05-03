import ts from 'typescript';

import { host } from '../host.js';
import { getOriginSymbolOfNode, getTypeOfTypeNode, isLiteralTypeOrNullType } from './checker.js';
import { factoryLiteral, getConstantLiteral } from './expression.js';

const {
  TypeQuery,
  LiteralType,
  StringLiteral,
  NumericLiteral,
  TrueKeyword,
  FalseKeyword,
  NullKeyword,
  TypeReference,
  IndexedAccessType,
  VariableDeclaration,
  ObjectLiteralExpression,
  ArrayLiteralExpression,
} = ts.SyntaxKind;

export const getValueOfLiteralType = type =>
  type.value
    ?? (type === host.checker.getTrueType()
      ? true
      : type === host.checker.getFalseType()
      ? false
      : type === host.checker.getNullType()
      ? null
      : undefined);

export function getLiteralNodeOfTypeNode(node) {
  switch (node.kind) {
    case LiteralType:
      return factoryLiteral(getValueOfLiteralType(getTypeOfTypeNode(node)));

    case TypeQuery:
      return node.exprName;

    case IndexedAccessType:
      return;
  }

  const type = getTypeOfTypeNode(node);

  if (isLiteralTypeOrNullType(type)) {
    return factoryLiteral(getValueOfLiteralType(type));
  }

  switch (node.kind) {
    case TypeQuery:
      return node.exprName;

    case TypeReference:
      return getConstantLiteral(node) ?? getLiteralNodeOfTypeNode(node.typeName);

    case IndexedAccessType:
      return;
  }
}

function getObjectOfObjectLiteral(node) {
  const object = {};

  for (const { name, initializer } of node.properties) {
    const key = name.escapedText ?? name.text;

    object[key] = getValueOfLiteral(initializer);
  }

  return object;
}

export function getValueOfLiteral(node) {
  switch (node.kind) {
    case TrueKeyword:
      return true;

    case FalseKeyword:
      return false;

    case NullKeyword:
      return null;

    case StringLiteral:
      return node.text;

    case NumericLiteral:
      return Number(node.text);

    case ObjectLiteralExpression:
      return getObjectOfObjectLiteral(node);

    case ArrayLiteralExpression:
      return node.elements.map(getValueOfLiteral);

    case VariableDeclaration:
      return getValueOfLiteral(node.initializer);
  }

  const symbol = getOriginSymbolOfNode(node);

  if (symbol?.valueDeclaration) {
    return getValueOfLiteral(symbol.valueDeclaration);
  }
}
