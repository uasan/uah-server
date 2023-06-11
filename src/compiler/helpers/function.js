import ts from 'typescript';
import { host } from '../host.js';
import { factoryIdentifier, factoryToken } from './expression.js';

export const {
  Block,
  AsyncKeyword,
  ArrowFunction,
  VariableDeclaration,
  EqualsGreaterThanToken,
  ParenthesizedExpression,
} = ts.SyntaxKind;

const factoryParameter = node =>
  host.factory.createParameterDeclaration(
    undefined,
    undefined,
    node,
    undefined,
    undefined,
    undefined
  );

export const factoryArrowFunction = (params, body) =>
  host.factory.createArrowFunction(
    undefined,
    undefined,
    Array.isArray(params) ? params : [factoryParameter(params)],
    undefined,
    factoryToken(EqualsGreaterThanToken),
    body
  );

export const factoryBodyFunction = statements =>
  host.factory.createArrowFunction(
    undefined,
    undefined,
    undefined,
    undefined,
    factoryToken(EqualsGreaterThanToken),
    host.factory.createBlock(statements, false)
  );

export const factoryRouteFunction = statements =>
  host.factory.createArrowFunction(
    [factoryToken(AsyncKeyword)],
    undefined,
    [
      factoryParameter(factoryIdentifier('res')),
      factoryParameter(factoryIdentifier('req')),
    ],
    undefined,
    factoryToken(EqualsGreaterThanToken),
    host.factory.createBlock(statements, false)
  );
