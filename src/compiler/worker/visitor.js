import ts from 'typescript';
import { host, transformers } from '../host.js';
import { makeImportDeclaration } from '../makers/import.js';
import { makeDecorator } from '../makers/declaration.js';
import { makeEnumDeclaration } from '../makers/enum.js';
import {
  makeClassDeclaration,
  makeFunctionDeclaration,
  makePropertyDeclaration,
} from '../makers/class.js';
import { isNotThisIdentifier } from '../helpers/checker.js';

const { SyntaxKind, visitEachChild, nullTransformationContext } = ts;

const returnUndefined = () => undefined;
const returnExpression = node => host.visit(node.expression);
const makeParameter = node =>
  isNotThisIdentifier(node.name) ? host.visitEachChild(node) : undefined;

const makers = {
  [SyntaxKind.Decorator]: makeDecorator,
  [SyntaxKind.Parameter]: makeParameter,
  [SyntaxKind.EnumDeclaration]: makeEnumDeclaration,
  [SyntaxKind.ClassExpression]: makeClassDeclaration,
  [SyntaxKind.ClassDeclaration]: makeClassDeclaration,
  [SyntaxKind.ImportDeclaration]: makeImportDeclaration,
  [SyntaxKind.PropertyDeclaration]: makePropertyDeclaration,
  [SyntaxKind.FunctionDeclaration]: makeFunctionDeclaration,

  [SyntaxKind.ArrayType]: returnUndefined,
  [SyntaxKind.UnionType]: returnUndefined,
  [SyntaxKind.AnyKeyword]: returnUndefined,
  [SyntaxKind.LiteralType]: returnUndefined,
  [SyntaxKind.TypeLiteral]: returnUndefined,
  [SyntaxKind.AsExpression]: returnExpression,
  [SyntaxKind.TypeParameter]: returnUndefined,
  [SyntaxKind.TypeReference]: returnUndefined,
  [SyntaxKind.DeclareKeyword]: returnUndefined,
  [SyntaxKind.StringKeyword]: returnUndefined,
  [SyntaxKind.NumberKeyword]: returnUndefined,
  [SyntaxKind.SymbolKeyword]: returnUndefined,
  [SyntaxKind.TypePredicate]: returnUndefined,
  [SyntaxKind.BigIntKeyword]: returnUndefined,
  [SyntaxKind.BooleanKeyword]: returnUndefined,
  [SyntaxKind.UnknownKeyword]: returnUndefined,
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
