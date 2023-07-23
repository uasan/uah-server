import ts from 'typescript';

import { decorators } from '../host.js';
import { getOriginSymbolOfNode } from './checker.js';
import { updateMethodStatements } from './function.js';

const { Decorator, CallExpression } = ts.SyntaxKind;

export const getSymbolDecorator = node =>
  getOriginSymbolOfNode(node.kind === CallExpression ? node.expression : node);

export function hasDecorator(node) {
  return (
    node.kind === Decorator &&
    decorators.get(getSymbolDecorator(node.expression)) === this
  );
}

export function decorMethodStatements(node, original, statements) {
  const offset = node.body.statements.length - original.body.statements.length;

  return updateMethodStatements(node, [
    ...node.body.statements.slice(0, offset),
    ...statements,
    ...node.body.statements.slice(offset),
  ]);
}
