import ts from 'typescript';
import { isObjectNode, isLiteralExpression } from './checker.js';
import { isAssignToken, isUnaryAssignToken, CommaToken } from './token.js';
import { host } from '../host.js';
import { factoryToken } from './expression.js';

const {
  Identifier,
  CallExpression,
  AwaitExpression,
  DeleteExpression,
  BinaryExpression,
  ExpressionStatement,
  PrefixUnaryExpression,
  ConditionalExpression,
  PostfixUnaryExpression,
  ParenthesizedExpression,
  EqualsEqualsEqualsToken,
  ElementAccessExpression,
  PropertyAccessExpression,
} = ts.SyntaxKind;

export const isMutation = node => {
  do
    switch (node.kind) {
      case PropertyAccessExpression:
      case ElementAccessExpression:
        if (node.parent?.kind === CallExpression)
          return isObjectNode(
            node.parent.expression === node ? node.expression : node
          );
        else continue;
      case BinaryExpression:
        return isAssignToken(node.operatorToken.kind);
      case PrefixUnaryExpression:
      case PostfixUnaryExpression:
        return isUnaryAssignToken(node.operator);
      case DeleteExpression:
        return true;
      case ParenthesizedExpression:
        if (node.expression) return isMutation(node.expression);
        else return false;
      default:
        return false;
    }
  while ((node = node.parent));
  return false;
};

export const isOperatorComma = node => node.operatorToken.kind === CommaToken;
export const isBinaryComma = node =>
  node.kind === BinaryExpression && isOperatorComma(node);

export const isLastBinaryComma = node =>
  node.parent.right === node &&
  node.parent.operatorToken.kind === CommaToken &&
  node.parent.parent.kind === ParenthesizedExpression;

export const isPrecedenceToRight = node => {
  switch (node.kind) {
    case BinaryExpression:
      return isOperatorComma(node) || isAssignToken(node.operatorToken.kind);

    case AwaitExpression:
    case ConditionalExpression:
      return true;

    default:
      return false;
  }
};

export const isUnusedResult = ({ parent }) => {
  switch (parent.kind) {
    case ExpressionStatement:
      return true;

    case BinaryExpression:
      return isOperatorComma(parent) && isLastBinaryComma(parent) === false;

    default:
      return false;
  }
};

export const isCanUndefine = ({ parent }) => {
  switch (parent.kind) {
    case BinaryExpression:
      return false;

    default:
      return true;
  }
};

export const isRefStatic = node => {
  do
    switch (node.kind) {
      case Identifier:
        return true;

      case PropertyAccessExpression:
        continue;

      case ElementAccessExpression:
        if (isLiteralExpression(node.argumentExpression)) continue;
        else return false;

      case ParenthesizedExpression:
        if (node.expression) continue;
        else return true;

      case BinaryExpression:
        return (
          isOperatorComma(node) &&
          isRefStatic(node.left) &&
          isRefStatic(node.right)
        );

      default:
        return isLiteralExpression(node);
    }
  while ((node = node.expression));

  return false;
};

export const factoryIsEqualsExpression = (left, right) =>
  host.factory.createBinaryExpression(
    left,
    factoryToken(EqualsEqualsEqualsToken),
    right
  );
