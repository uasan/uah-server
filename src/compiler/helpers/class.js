import { host } from '../host.js';
import { factoryToken } from './expression.js';
import { StaticKeyword } from './checker.js';

export const factoryStaticProperty = (name, value) =>
  host.factory.createPropertyDeclaration(
    [factoryToken(StaticKeyword)],
    name,
    undefined,
    undefined,
    value
  );

export const factoryClassStaticBlock = statements =>
  host.factory.createClassStaticBlockDeclaration(
    host.factory.createBlock(statements, true)
  );

export function addToStaticBlock(node, statements) {
  return host.factory.updateClassDeclaration(
    node,
    node.modifiers,
    node.name,
    undefined,
    node.heritageClauses,
    [...node.members, factoryClassStaticBlock(statements)]
  );
}
