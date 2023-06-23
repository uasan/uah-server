import ts from 'typescript';

import { decorators } from '../host.js';
import { getOriginSymbolOfNode } from './checker.js';

const { Decorator, CallExpression } = ts.SyntaxKind;

export function getInternalDecorators({ modifiers }) {
  const map = new Map();

  for (const { kind, expression } of modifiers)
    if (kind === Decorator) {
      const symbol = getOriginSymbolOfNode(
        expression.kind === CallExpression ? expression.expression : expression
      );

      if (decorators.has(symbol)) {
        map.set(symbol.name, decorators.get(symbol).meta(expression));
      }
    }

  return map;
}
