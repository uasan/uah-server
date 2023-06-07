import ts from 'typescript';
import { host } from '../host.js';
import { isStatement, toStatement } from './statement.js';
import { isBinaryComma, isRefStatic, isPrecedenceToRight } from './operator.js';

const tokens = Object.create(null);
const bigints = Object.create(null);
const numbers = Object.create(null);
const strings = Object.create(null);
const identifiers = Object.create(null);

export const {
  Identifier,
  Parameter,
  PlusToken,
  ColonToken,
  ArrowFunction,
  JsxExpression,
  QuestionToken,
  StringLiteral,
  NumericLiteral,
  BindingElement,
  NullKeyword,
  TrueKeyword,
  FalseKeyword,
  BigIntLiteral,
  AwaitExpression,
  ExclamationToken,
  VariableDeclaration,
  ObjectBindingPattern,
  QuestionQuestionToken,
  ElementAccessExpression,
  EqualsEqualsEqualsToken,
  ParenthesizedExpression,
  PropertyAccessExpression,
  AmpersandAmpersandToken,
} = ts.SyntaxKind;

export const factoryToken = kind =>
  (tokens[kind] ??= host.factory.createToken(kind));

export const factoryNumber = number =>
  (numbers[number] ??= host.factory.createNumericLiteral(number));

export const factoryString = string =>
  (strings[string] ??= host.factory.createStringLiteral(string));

export const factoryBigInt = string =>
  (bigints[string] ??= host.factory.createBigIntLiteral(string));

export const factoryIdentifier = string =>
  (identifiers[string] ??= host.factory.createIdentifier(string));

export const getSingleExpression = node =>
  node?.kind === ParenthesizedExpression ? node.expression : node;

export const getParentExpression = node => {
  const { realm } = host;

  while (node !== realm && node.parent) {
    switch (node.parent.kind) {
      case JsxExpression:
      case ArrowFunction:
      case VariableDeclaration:
      case Parameter:
      case BindingElement:
      case ObjectBindingPattern:
        return node;

      case AwaitExpression:
        return node.parent;

      default:
        if (isStatement(node.parent) || isStatement(node)) return node;
    }
    node = node.parent;
  }
  return node;
};

export const factoryNullish = (left, right = factoryString('')) =>
  host.factory.createBinaryExpression(
    isPrecedenceToRight(left.kind)
      ? host.factory.createParenthesizedExpression(left)
      : left,
    factoryToken(QuestionQuestionToken),
    right
  );

export const factoryIsEqual = (left, right) =>
  host.factory.createBinaryExpression(
    left,
    factoryToken(EqualsEqualsEqualsToken),
    right
  );

export const factoryIfEqual = (
  left,
  right = host.factory.createVoidZero(),
  expression
) =>
  host.factory.createIfStatement(
    host.factory.createBinaryExpression(
      left,
      factoryToken(EqualsEqualsEqualsToken),
      right
    ),
    isStatement(expression) ? expression : toStatement(expression),
    undefined
  );

export const getLiteralValue = node => {
  switch (node.kind) {
    case StringLiteral:
      return factoryString(node.text);

    case NumericLiteral:
      return factoryNumber(node.text);

    case NullKeyword:
    case TrueKeyword:
    case FalseKeyword:
      return factoryString(node.getText());

    case BigIntLiteral:
      return factoryString(node.getText().slice(0, -1));

    case Identifier:
      if (node.escapedText === 'undefined') return factoryString('undefined');
  }
};

export const factoryStringConcat = (left, right) =>
  host.factory.createBinaryExpression(left, factoryToken(PlusToken), right);

export const factoryTernary = (condition, whenTrue, whenFalse) =>
  host.factory.createConditionalExpression(
    condition,
    factoryToken(QuestionToken),
    whenTrue,
    factoryToken(ColonToken),
    whenFalse
  );

export const factoryAndExpressions = (left, right) =>
  host.factory.createBinaryExpression(
    left,
    factoryToken(AmpersandAmpersandToken),
    right
  );

export const factoryNotExpressions = node =>
  host.factory.createPrefixUnaryExpression(ExclamationToken, node);

export const factoryIfConditions = (conditions, statements) =>
  host.factory.createIfStatement(
    conditions.length === 1
      ? conditions[0]
      : conditions.reduce(factoryAndExpressions),
    statements.length === 1
      ? statements[0]
      : host.factory.createBlock(statements, false),
    undefined
  );

export const updateBinaryExpression = (node, left, right) =>
  host.factory.updateBinaryExpression(node, left, node.operatorToken, right);

export const reduceBinaryComma = (node, noLast = false) => {
  if (isBinaryComma(node.left)) {
    const left = reduceBinaryComma(node.left, true);

    if (left === node.left) {
      return node;
    } else if (left) {
      return noLast && isRefStatic(node.right)
        ? left
        : updateBinaryExpression(node, left, node.right);
    }
  } else if (isRefStatic(node.left) === false) {
    return node;
  }

  return noLast && isRefStatic(node.right) ? undefined : node.right;
};
