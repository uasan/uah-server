import ts from 'typescript';
import { host } from '../host.js';
import { factoryToken } from './expression.js';
import { StaticKeyword } from './checker.js';

export const { ClassDeclaration } = ts.SyntaxKind;

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

export const updateClass = (
  node,
  modifiers,
  name,
  heritageClauses,
  statements
) =>
  node.kind === ClassDeclaration
    ? host.factory.updateClassDeclaration(
        node,
        modifiers,
        name,
        undefined,
        heritageClauses,
        statements
      )
    : host.factory.updateClassExpression(
        node,
        modifiers,
        name,
        undefined,
        heritageClauses,
        statements
      );

export const addToStaticBlock = (node, statements) =>
  updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    ...node.members,
    factoryClassStaticBlock(statements),
  ]);
