import { factoryCallMethod } from '#compiler/helpers/call.js';
import {
  getTypeOfNode,
  isFalseKeyword,
  isNumberType,
  isTrueKeyword,
} from '#compiler/helpers/checker.js';
import { factoryIfReturn } from '#compiler/helpers/statement.js';

export function makeCache(decor, req, res, ctx) {
  if (!decor?.expression) return;

  const arg = decor.expression.arguments[0];
  const name = decor.expression.expression;
  const type = getTypeOfNode(arg);

  if (isTrueKeyword(arg)) {
    return {
      check: factoryIfReturn(
        factoryCallMethod(name, 'checkImmutable', [req, res]),
      ),
      preset: factoryCallMethod(name, 'setImmutable', [ctx]),
    };
  } else if (isFalseKeyword(arg)) {
    return {
      preset: factoryCallMethod(name, 'setNoStore', [ctx]),
    };
  } else if (isNumberType(type)) {
    return {
      check: factoryIfReturn(factoryCallMethod(name, 'checkAge', [req, res])),
      preset: factoryCallMethod(name, 'setAge', [ctx, arg]),
    };
  }
}

export function Cache(node) {
  return node;
}
