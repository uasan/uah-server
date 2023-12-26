import ts from 'typescript';
import { host } from '../host.js';
import { factoryToken } from './expression.js';
import { StaticKeyword, isStaticKeyword } from './checker.js';

export const { ClassDeclaration, PropertyDeclaration } = ts.SyntaxKind;

export const factoryStaticProperty = (name, value) =>
  host.factory.createPropertyDeclaration(
    [factoryToken(StaticKeyword)],
    name,
    undefined,
    undefined,
    value
  );

export const factoryStaticMethod = (name, args, statements) =>
  host.factory.createMethodDeclaration(
    [factoryToken(StaticKeyword)],
    undefined,
    name,
    undefined,
    undefined,
    args,
    undefined,
    host.factory.createBlock(statements, true)
  );

export const factoryClassStaticBlock = statements =>
  host.factory.createClassStaticBlockDeclaration(
    host.factory.createBlock(statements, true)
  );

export const updateClass = (node, modifiers, name, heritageClauses, members) =>
  node.kind === ClassDeclaration
    ? host.factory.updateClassDeclaration(
        node,
        modifiers,
        name,
        undefined,
        heritageClauses,
        members
      )
    : host.factory.updateClassExpression(
        node,
        modifiers,
        name,
        undefined,
        heritageClauses,
        members
      );

export const isFieldProperty = member =>
  member.kind === PropertyDeclaration &&
  !member.modifiers?.some(isStaticKeyword);

export const addToStaticBlock = (node, statements) =>
  updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    ...node.members,
    factoryClassStaticBlock(statements),
  ]);
