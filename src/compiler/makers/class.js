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

  node =
    getInternalClassOfExtends(node)?.make(node) ?? host.visitEachChild(node);

  return updateClass(
    node,
    node.modifiers?.filter(isNativeModifier),
    node.name,
    node.heritageClauses?.filter(isExtendsToken),
    node.members
  );
}

export function makePropertyDeclaration(node) {
  node = host.visitEachChild(node);

  return host.factory.updatePropertyDeclaration(
    node,
    node.modifiers?.filter(isNativeModifier),
    node.name,
    undefined,
    undefined,
    node.initializer
  );
}
