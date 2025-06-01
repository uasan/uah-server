import {
  getOriginSymbol,
  getOriginSymbolClass,
  getOriginSymbolOfNode,
  getPropertiesOfTypeNode,
  getTypeOfSymbol,
  isDeclareKeyword,
  isExtendsToken,
  isImplementsToken,
  isNativeModifier,
} from '../helpers/checker.js';
import { updateClass } from '../helpers/class.js';
import { declarations, host, metaSymbols, types } from '../host.js';

const getMemberEntry = symbol => [symbol.escapedName, getTypeOfSymbol(symbol)];
const getTypeArgument = ({ typeArguments }) =>
  typeArguments
    ? new Map(getPropertiesOfTypeNode(typeArguments[0]).map(getMemberEntry))
    : undefined;

export function getImplement(node) {
  if (node.heritageClauses) {
    for (const heritage of node.heritageClauses) {
      if (isImplementsToken(heritage)) {
        const ctor = types.get(getOriginSymbolOfNode(heritage.types[0].expression));

        if (ctor) {
          return ctor;
        }
      }
    }
  }
}

function makeInternalClassOfExtends(node, extend = node) {
  if (extend.heritageClauses) {
    const heritage = extend.heritageClauses.find(isExtendsToken);

    if (heritage) {
      const type = heritage.types[0];
      const symbol = getOriginSymbolOfNode(type.expression);

      if (symbol) {
        const maker = declarations.get(symbol);
        if (maker?.make) {
          if (maker.make.length === 1) {
            return maker.make(node);
          } else {
            const symbol = getOriginSymbolClass(extend);
            return maker.make(node, {
              symbol,
              arg: getTypeArgument(type),
              meta: metaSymbols.get(symbol),
            });
          }
        } else {
          return makeInternalClassOfExtends(node, symbol.valueDeclaration);
        }
      }
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
    node.members,
  );
}

export function makeMethodDeclaration(node) {
  return host.factory.updateMethodDeclaration(
    node,
    node.modifiers && node.modifiers?.filter(isNativeModifier).map(host.visit).filter(Boolean),
    undefined,
    node.name,
    undefined,
    undefined,
    node.parameters?.length ? [host.visit(node.parameters[0])] : undefined,
    undefined,
    node.body && host.visit(node.body),
  );
}

export function makePropertyDeclaration(node) {
  const initializer = node.initializer && host.visit(node.initializer);

  return initializer
    ? host.factory.updatePropertyDeclaration(
      node,
      node.modifiers && node.modifiers?.filter(isNativeModifier).map(host.visit).filter(Boolean),
      node.name,
      undefined,
      undefined,
      initializer,
    )
    : undefined;
}
