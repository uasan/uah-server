import ts from 'typescript';
import { host } from '../host.js';
import { factoryIdentifier, factoryToken } from './expression.js';
import { factoryLet } from './var.js';

export const {
  Block,
  Identifier,
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

export const updateMethodStatements = (node, statements) =>
  host.factory.updateMethodDeclaration(
    node,
    node.modifiers,
    undefined,
    node.name,
    undefined,
    undefined,
    node.parameters,
    undefined,
    host.factory.updateBlock(node.body, statements)
  );

export function ensureArgument(node, index = 0) {
  const { name } = node.parameters[index];

  if (name.kind === Identifier) {
    return node;
  }

  const parameters = [...node.parameters];
  const arg = host.module.createIdentifier('_');

  parameters[index] = host.factory.updateParameterDeclaration(
    node.parameters[index],
    undefined,
    undefined,
    arg,
    undefined,
    undefined,
    undefined
  );

  return updateMethodStatements(node, [
    factoryLet(name, arg),
    ...node.body.statements,
  ]);
}
