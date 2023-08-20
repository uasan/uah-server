import { host, declarations } from '../host.js';
import {
  isExtendsToken,
  isDeclareKeyword,
  isNativeModifier,
  getOriginSymbolOfNode,
  getPropertiesOfTypeNode,
  getTypeOfSymbol,
} from '../helpers/checker.js';
import { updateClass } from '../helpers/class.js';

const getMemberEntry = symbol => [symbol.escapedName, getTypeOfSymbol(symbol)];
const getTypeArgument = ({ typeArguments }) =>
  typeArguments
    ? new Map(getPropertiesOfTypeNode(typeArguments[0]).map(getMemberEntry))
    : undefined;

function makeInternalClassOfExtends(node, extend = node) {
  const heritage = extend.heritageClauses?.find(isExtendsToken);

  if (heritage) {
    const type = heritage.types[0];
    const symbol = getOriginSymbolOfNode(type.expression);

    if (symbol) {
      return declarations.has(symbol)
        ? declarations.get(symbol).make(node, getTypeArgument(type))
        : makeInternalClassOfExtends(node, symbol.valueDeclaration);
    }
  }
}

export const makeFunctionDeclaration = node =>
  node.modifiers?.some(isDeclareKeyword)
    ? undefined
    : host.visitEachChild(node);

export function makeClassDeclaration(node) {
  if (node.modifiers?.some(isDeclareKeyword)) {
    return;
  }

  node = makeInternalClassOfExtends(node) ?? host.visitEachChild(node);

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
