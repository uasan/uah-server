import ts from 'typescript';
import { host } from '../host.js';
import { factoryToken } from './expression.js';

export const { Let, Const } = ts.NodeFlags;
export const {
  Identifier,
  EqualsToken,
  StringLiteral,
  OmittedExpression,
  BinaryExpression,
  VariableDeclaration,
  ArrayBindingPattern,
  ObjectBindingPattern,
} = ts.SyntaxKind;

export const factoryConstStatement = params =>
  host.factory.createVariableStatement(
    undefined,
    host.factory.createVariableDeclarationList(params, Const)
  );

export const factoryLetStatement = params =>
  host.factory.createVariableStatement(
    undefined,
    host.factory.createVariableDeclarationList(params, Let)
  );

export const factoryVarDeclaration = (name, value) =>
  host.factory.createVariableDeclaration(name, undefined, undefined, value);

export const factoryConstant = (name, value) =>
  factoryConstStatement([factoryVarDeclaration(name, value)]);

export const factoryAssign = (left, right) =>
  host.factory.createBinaryExpression(left, factoryToken(EqualsToken), right);
