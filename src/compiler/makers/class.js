import { host } from '../host.js';
import {
  isExtendsToken,
  isDeclareKeyword,
  isNativeModifier,
  getInternalClassOfExtends,
} from '../helpers/checker.js';
import { updateClass } from '../helpers/class.js';

export function makeClassDeclaration(node) {
  if (node.modifiers?.some(isDeclareKeyword)) {
    return;
  }

  const internal = getInternalClassOfExtends(node);

  node = internal ? internal.make(node) : host.visitEachChild(node);

  return updateClass(
    node,
    node.modifiers?.filter(isNativeModifier),
    node.name,
    node.heritageClauses?.filter(isExtendsToken),
    node.members
  );
}

export const makePropertyDeclaration = node =>
  host.factory.updatePropertyDeclaration(
    node,
    node.modifiers?.filter(isNativeModifier),
    node.name,
    undefined,
    undefined,
    node.initializer && host.visit(node.initializer)
  );
