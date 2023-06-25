import { isTrueKeyword } from '../helpers/checker.js';
import { getSymbolDecorator } from '../helpers/decorators.js';
import { decorators, host } from '../host.js';

export const Permission = {
  meta(node) {
    const rule = node.arguments[0];
    const isPublic = !!rule && isTrueKeyword(rule);

    return {
      rule,
      isPublic,
    };
  },
};

export const makeDecorator = node => {
  const symbol = getSymbolDecorator(node.expression);

  if (decorators.has(symbol)) {
    // console.info(node.parent);
  } else {
    return host.visitEachChild(node);
  }
};
