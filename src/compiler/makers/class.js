import { host } from '../host.js';
import {
  isExtendsToken,
  isDeclareKeyword,
  isNativeModifier,
} from '../helpers/checker.js';

export function makeClassDeclaration(node) {
  if (!node.modifiers?.some(isDeclareKeyword)) {
    node = host.visitEachChild(node);
    return host.factory.updateClassDeclaration(
      node,
      node.modifiers?.filter(isNativeModifier),
      node.name,
      undefined,
      node.heritageClauses?.filter(isExtendsToken),
      node.members
    );
  }
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
