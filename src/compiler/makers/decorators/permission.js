import { isTrueKeyword } from '../../helpers/checker.js';

export function Permission(node) {
  return node;
}

Permission.getMeta = node => {
  const rule = node.arguments[0];
  const isPublic = !!rule && isTrueKeyword(rule);

  return {
    rule,
    isPublic,
  };
};
