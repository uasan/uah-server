import ts from 'typescript';
import { host } from '../host.js';
import { factoryToken } from './expression.js';

export const { Let, Const } = ts.NodeFlags;
export const {
  Decorator,
  Identifier,
  EqualsToken,
  StringLiteral,
  ExportKeyword,
  StaticKeyword,
  DefaultKeyword,
  OmittedExpression,
  BinaryExpression,
  VariableDeclaration,
  ArrayBindingPattern,
  ObjectBindingPattern,
} = ts.SyntaxKind;

export const factoryConstStatement = (params, modifiers) =>
  host.factory.createVariableStatement(
    modifiers,
    host.factory.createVariableDeclarationList(params, Const)
  );

export const factoryLetStatement = params =>
  host.factory.createVariableStatement(
    undefined,
    host.factory.createVariableDeclarationList(params, Let)
  );

export const factoryVarDeclaration = (name, value) =>
  host.factory.createVariableDeclaration(name, undefined, undefined, value);

export const factoryConstant = (name, value, modifiers) =>
  factoryConstStatement([factoryVarDeclaration(name, value)], modifiers);

export const factoryLet = (name, value) =>
  factoryLetStatement([factoryVarDeclaration(name, value)]);

export const factoryAssign = (left, right) =>
  host.factory.createBinaryExpression(left, factoryToken(EqualsToken), right);

export const factoryAssignStatement = (left, right) =>
  host.factory.createExpressionStatement(factoryAssign(left, right));

export const factoryAssignProperty = (object, key, value) =>
  factoryAssign(
    host.factory.createPropertyAccessExpression(object, key),
    value
  );

export const factoryAssignPropertyStatement = (object, key, value) =>
  host.factory.createExpressionStatement(
    factoryAssignProperty(object, key, value)
  );

export const getNodeTextName = node => node.name?.escapedText ?? 'default';
