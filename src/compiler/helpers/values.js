import ts from 'typescript';
import { factoryLiteral, getConstantLiteral } from './expression.js';
import { getTypeOfTypeNode, isLiteralTypeOrNullType } from './checker.js';
import { host } from '../host.js';

const { TypeQuery, LiteralType, TypeReference, IndexedAccessType } =
  ts.SyntaxKind;

export const getValueOfLiteralType = type =>
  type.value ??
  (type === host.checker.getTrueType()
    ? true
    : type === host.checker.getFalseType()
      ? false
      : type === host.checker.getNullType()
        ? null
        : undefined);

export function getValueOfTypeNode(node) {
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
      return getConstantLiteral(node) ?? getValueOfTypeNode(node.typeName);

    case IndexedAccessType:
      return;
  }
}
