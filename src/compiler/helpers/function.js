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

export const factoryParameter = node =>
  host.factory.createParameterDeclaration(
    undefined,
    undefined,
    node,
    undefined,
    undefined,
    undefined,
  );

export const factoryArrowFunction = (params, body) =>
  host.factory.createArrowFunction(
    undefined,
    undefined,
    Array.isArray(params) ? params : [factoryParameter(params)],
    undefined,
    factoryToken(EqualsGreaterThanToken),
    body,
  );

export const factoryBodyFunction = statements =>
  host.factory.createArrowFunction(
    undefined,
    undefined,
    undefined,
    undefined,
    factoryToken(EqualsGreaterThanToken),
    host.factory.createBlock(statements, false),
  );

export const factoryRouteFunction = (isAsync, statements) =>
  host.factory.createArrowFunction(
    isAsync ? [factoryToken(AsyncKeyword)] : undefined,
    undefined,
    [
      factoryParameter(factoryIdentifier('res')),
      factoryParameter(factoryIdentifier('req')),
    ],
    undefined,
    factoryToken(EqualsGreaterThanToken),
    host.factory.createBlock(statements, false),
  );

export const updateMethod = (node, parameters, statements) =>
  host.factory.updateMethodDeclaration(
    node,
    node.modifiers,
    undefined,
    node.name,
    undefined,
    undefined,
    parameters,
    undefined,
    host.factory.updateBlock(node.body, statements),
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
    host.factory.updateBlock(node.body, statements),
  );

export function ensureArgument(node, index = 0) {
  const parameter = node.parameters[index];

  if (parameter.name.kind === Identifier) {
    return node;
  }

  const parameters = [...node.parameters];
  const arg = host.module.createIdentifier('_');

  parameters[index] = host.factory.updateParameterDeclaration(
    parameter,
    undefined,
    undefined,
    arg,
    undefined,
    undefined,
    undefined,
  );

  return updateMethod(node, parameters, [
    factoryLet(parameter.name, arg),
    ...node.body.statements,
  ]);
}
