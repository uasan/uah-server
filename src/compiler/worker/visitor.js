import ts from 'typescript';
import { host, transformers } from '../host.js';
import {
  makeClassDeclaration,
  makeFunctionDeclaration,
  makeMethodDeclaration,
  makePropertyDeclaration,
} from '../makers/class.js';
import { makeDecorator } from '../makers/declaration.js';
import { makeEnumDeclaration } from '../makers/enum.js';
import { makeImportDeclaration } from '../makers/import.js';

const { SyntaxKind, visitEachChild, nullTransformationContext } = ts;

const returnUndefined = () => undefined;
const returnExpression = node => host.visit(node.expression);

function makeParameter(node) {
  if (node.name.escapedText !== 'this') {
    node = host.visitEachChild(node);

    return host.factory.updateParameterDeclaration(
      node,
      undefined,
      node.dotDotDotToken,
      node.name,
      undefined,
      undefined,
      node.initializer,
    );
  }
}

const makers = {
  [SyntaxKind.Decorator]: makeDecorator,
  [SyntaxKind.Parameter]: makeParameter,
  [SyntaxKind.EnumDeclaration]: makeEnumDeclaration,
  [SyntaxKind.ClassExpression]: makeClassDeclaration,
  [SyntaxKind.ClassDeclaration]: makeClassDeclaration,
  [SyntaxKind.ImportDeclaration]: makeImportDeclaration,
  [SyntaxKind.MethodDeclaration]: makeMethodDeclaration,
  [SyntaxKind.PropertyDeclaration]: makePropertyDeclaration,
  [SyntaxKind.FunctionDeclaration]: makeFunctionDeclaration,

  [SyntaxKind.ArrayType]: returnUndefined,
  [SyntaxKind.UnionType]: returnUndefined,
  [SyntaxKind.AnyKeyword]: returnUndefined,
  [SyntaxKind.LiteralType]: returnUndefined,
  [SyntaxKind.TupleType]: returnUndefined,
  [SyntaxKind.FunctionType]: returnUndefined,
  [SyntaxKind.TypeLiteral]: returnUndefined,
  [SyntaxKind.TypeOperator]: returnUndefined,
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
  [SyntaxKind.ConstructorType]: returnUndefined,
  [SyntaxKind.ModuleDeclaration]: returnUndefined,
  [SyntaxKind.TypeAliasDeclaration]: returnUndefined,
  [SyntaxKind.InterfaceDeclaration]: returnUndefined,

  [SyntaxKind.AsExpression]: returnExpression,
  [SyntaxKind.NonNullExpression]: returnExpression,
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
