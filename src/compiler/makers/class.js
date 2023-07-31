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
  const modifiers =
    node.modifiers && host.visit(node.modifiers)?.filter(isNativeModifier);

  const initializer = node.initializer && host.visit(node.initializer);

  return initializer
    ? host.factory.updatePropertyDeclaration(
        node,
        modifiers,
        node.name,
        undefined,
        undefined,
        initializer
      )
    : undefined;
}
