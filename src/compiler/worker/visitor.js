import ts from 'typescript';
import { host } from '../host.js';
import { makeImportDeclaration } from '../makers/import.js';

const { visitEachChild, SyntaxKind, nullTransformationContext } = ts;

const returnUndefined = node => undefined;
const returnExpression = node => host.visit(node.expression);

const makers = {
  [SyntaxKind.ImportDeclaration]: makeImportDeclaration,

  [SyntaxKind.ArrayType]: returnUndefined,
  [SyntaxKind.UnionType]: returnUndefined,
  [SyntaxKind.LiteralType]: returnUndefined,
  [SyntaxKind.TypeLiteral]: returnUndefined,
  [SyntaxKind.AsExpression]: returnExpression,
  [SyntaxKind.TypeParameter]: returnUndefined,
  [SyntaxKind.TypeReference]: returnUndefined,
  [SyntaxKind.StringKeyword]: returnUndefined,
  [SyntaxKind.NumberKeyword]: returnUndefined,
  [SyntaxKind.SymbolKeyword]: returnUndefined,
  [SyntaxKind.BooleanKeyword]: returnUndefined,
  [SyntaxKind.EnumDeclaration]: returnUndefined,
  [SyntaxKind.IntersectionType]: returnUndefined,
  [SyntaxKind.ModuleDeclaration]: returnUndefined,
  [SyntaxKind.TypeAliasDeclaration]: returnUndefined,
  [SyntaxKind.InterfaceDeclaration]: returnUndefined,
  [SyntaxKind.SatisfiesExpression]: returnExpression,
};

export function visit(node) {
  const action = makers[node.kind];

  return action !== undefined
    ? action(node)
    : visitEachChild(node, visit, nullTransformationContext);
}

host.visit = visit;
