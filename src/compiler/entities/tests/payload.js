import ts from 'typescript';

import { getOriginSymbolOfNode, getTypeOfNode, isStaticKeyword } from '#compiler/helpers/checker.js';
import { factoryString } from '#compiler/helpers/expression.js';
import { getTsUrlFromPath } from '#compiler/helpers/link.js';
import { factoryObjectLiteral, factoryProperty } from '#compiler/helpers/object.js';
import { host, metaSymbols } from '#compiler/host.js';

const { MethodDeclaration } = ts.SyntaxKind;

export const isTestMethod = node =>
  node.kind === MethodDeclaration
  && node.name.escapedText === 'test'
  && !node.modifiers?.some(isStaticKeyword);

export const getTestURL = ({ path }, node) =>
  factoryString(getTsUrlFromPath(path) + ':' + (host.file.getLineAndCharacterOfPosition(node.getStart()).line + 1));

export function setParentTests(args, type) {
  if (type.properties?.length) {
    const props = [];

    for (const { declarations: [{ name, type: { typeName } }] } of type.properties) {
      if (metaSymbols.get(getOriginSymbolOfNode(typeName))?.isTest) {
        props.push(factoryProperty(name, typeName));
      }
    }

    if (props.length) {
      args.push(factoryObjectLiteral(props));
    }
  }
}
