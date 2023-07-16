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

export const factoryAssign = (left, right) =>
  host.factory.createBinaryExpression(left, factoryToken(EqualsToken), right);
