import { isTrueKeyword } from '../helpers/checker.js';

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
  return;
};
