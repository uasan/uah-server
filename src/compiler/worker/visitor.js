import ts from 'typescript';
import { host, transformers } from '../host.js';
import { makeImportDeclaration } from '../makers/import.js';
import { makeDecorator } from '../makers/declaration.js';
import { makeEnumDeclaration } from '../makers/enum.js';
import {
  makeClassDeclaration,
  makePropertyDeclaration,
} from '../makers/class.js';

const { visitEachChild, SyntaxKind, nullTransformationContext } = ts;

const returnUndefined = () => undefined;
const returnExpression = node => host.visit(node.expression);

const makers = {
  [SyntaxKind.EnumDeclaration]: makeEnumDeclaration,
  [SyntaxKind.ImportDeclaration]: makeImportDeclaration,
  [SyntaxKind.Decorator]: makeDecorator,
  [SyntaxKind.ClassDeclaration]: makeClassDeclaration,
  [SyntaxKind.ClassExpression]: makeClassDeclaration,
  [SyntaxKind.PropertyDeclaration]: makePropertyDeclaration,

  [SyntaxKind.ArrayType]: returnUndefined,
  [SyntaxKind.UnionType]: returnUndefined,
  [SyntaxKind.LiteralType]: returnUndefined,
  [SyntaxKind.TypeLiteral]: returnUndefined,
  [SyntaxKind.AsExpression]: returnExpression,
  [SyntaxKind.TypeParameter]: returnUndefined,
  [SyntaxKind.TypeReference]: returnUndefined,
  [SyntaxKind.AnyKeyword]: returnUndefined,
  [SyntaxKind.StringKeyword]: returnUndefined,
  [SyntaxKind.NumberKeyword]: returnUndefined,
  [SyntaxKind.SymbolKeyword]: returnUndefined,
  [SyntaxKind.BooleanKeyword]: returnUndefined,
  [SyntaxKind.IntersectionType]: returnUndefined,
  [SyntaxKind.ModuleDeclaration]: returnUndefined,
  [SyntaxKind.TypeAliasDeclaration]: returnUndefined,
  [SyntaxKind.InterfaceDeclaration]: returnUndefined,
  [SyntaxKind.SatisfiesExpression]: returnExpression,
};

export function visit(node) {
  const action = makers[node.kind];

  let result =
    action !== undefined
      ? action(node)
      : visitEachChild(node, visit, nullTransformationContext);

  if (transformers.has(node)) {
    for (const transform of transformers.get(node)) {
      result = transform(result, node);
    }
    transformers.delete(node);
  }

  return result;
}

host.visit = visit;
