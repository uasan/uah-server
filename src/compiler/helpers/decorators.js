import ts from 'typescript';

import { decorators } from '../host.js';
import { getOriginSymbolOfNode } from './checker.js';

const { Decorator, CallExpression } = ts.SyntaxKind;

export const getSymbolDecorator = node =>
  getOriginSymbolOfNode(node.kind === CallExpression ? node.expression : node);

export function getInternalDecorators({ modifiers }) {
  const map = new Map();

  for (const { kind, expression } of modifiers)
    if (kind === Decorator) {
      const symbol = getSymbolDecorator(expression);

      if (decorators.has(symbol)) {
        map.set(symbol.escapedName, decorators.get(symbol).getMeta(expression));
      }
    }

  return map;
}
