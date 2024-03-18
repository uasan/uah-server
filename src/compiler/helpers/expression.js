import ts from 'typescript';
import { host } from '../host.js';
import { isStatement, toStatement } from './statement.js';

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
  QuestionDotToken,
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

export const factoryNull = () => host.factory.createNull();
export const factoryTrue = () => host.factory.createTrue();
export const factoryFalse = () => host.factory.createFalse();

export function factoryLiteral(value) {
  switch (typeof value) {
    case 'string':
      return factoryString(value);
    case 'number':
      return factoryNumber(value);
    case 'boolean':
      return value ? factoryTrue() : factoryFalse();
  }

  if (value === null) return factoryNull();
}

export const getConstantLiteral = node =>
  factoryLiteral(host.checker.getConstantValue(node));

export function getValueOfLiteral(node) {
  switch (node.kind) {
    case StringLiteral:
      return node.text;
    case NumericLiteral:
      return Number(node.text);
    case NullKeyword:
      return null;
    case TrueKeyword:
      return true;
    case FalseKeyword:
      return false;
    case BigIntLiteral:
      return node.text;
  }
}

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

export const getLiteralNode = node => {
  switch (node.kind) {
    case StringLiteral:
    case NumericLiteral:
    case NullKeyword:
    case TrueKeyword:
    case FalseKeyword:
    case BigIntLiteral:
      return node;
  }
};

export const factoryNotExpression = node =>
  host.factory.createPrefixUnaryExpression(ExclamationToken, node);

export const factoryPlusExpression = node =>
  host.factory.createPrefixUnaryExpression(PlusToken, node);

export const factoryAwait = node => host.factory.createAwaitExpression(node);

export const factoryAwaitParenthesized = node =>
  host.factory.createParenthesizedExpression(
    host.factory.createAwaitExpression(node)
  );

export const factoryPropertyParenthesized = (
  left,
  right,
  isNullable = false
) =>
  isNullable
    ? host.factory.createPropertyAccessChain(
        host.factory.createParenthesizedExpression(left),
        host.factory.createToken(QuestionDotToken),
        right
      )
    : host.factory.createPropertyAccessExpression(
        host.factory.createParenthesizedExpression(left),
        right
      );

export const factoryAwaitStatement = node =>
  host.factory.createExpressionStatement(
    host.factory.createAwaitExpression(node)
  );
