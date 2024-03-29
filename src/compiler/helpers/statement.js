import ts from 'typescript';
import { host } from '../host.js';

const {
  FirstStatement,
  LastStatement,
  VariableStatement,
  ExpressionStatement,
  IfStatement,
  DoStatement,
  WhileStatement,
  ForStatement,
  ForInStatement,
  ForOfStatement,
  ContinueStatement,
  BreakStatement,
  ReturnStatement,
  WithStatement,
  SwitchStatement,
  LabeledStatement,
  ThrowStatement,
  TryStatement,
  DebuggerStatement,
} = ts.SyntaxKind;

export const isStatement = ({ kind }) => {
  switch (kind) {
    case ExpressionStatement:
    case VariableStatement:
    case FirstStatement:
    case LastStatement:
    case IfStatement:
    case DoStatement:
    case WhileStatement:
    case ForStatement:
    case ForInStatement:
    case ForOfStatement:
    case ContinueStatement:
    case BreakStatement:
    case ReturnStatement:
    case WithStatement:
    case SwitchStatement:
    case LabeledStatement:
    case ThrowStatement:
    case TryStatement:
    case DebuggerStatement:
      return true;
  }
  return false;
};

export const toStatement = node =>
  isStatement(node) ? node : host.factory.createExpressionStatement(node);

export const setStatementsIfNeeded = nodes => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (isStatement(node) === false)
      nodes[i] = host.factory.createExpressionStatement(node);
  }

  return nodes;
};

export const factoryIfReturn = (isValue, returnValue) =>
  host.factory.createIfStatement(
    isValue,
    host.factory.createReturnStatement(returnValue),
    undefined
  );
