import ts from 'typescript';
import { declarations, host } from '../host.js';

export const {
  Any: flagAny,
  Null: flagNull,
  Never: flagNever,
  Object: flagObject,
  String: flagString,
  Number: flagNumber,
  Boolean: flagBoolean,
  Unknown: flagUnknown,
  Literal: flagLiteral,
  VoidLike: flagVoidLike,
  EnumLike: flagEnumLike,
  Undefined: flagUndefined,
  StringLike: flagStringLike,
  NumberLike: flagNumberLike,
  BooleanLike: flagBooleanLike,
  BigIntLike: flagBigIntLike,
  NonPrimitive: flagNonPrimitive,
  ObjectFlagsType,
} = ts.TypeFlags;

export const {
  Decorator,
  TrueKeyword,
  FalseKeyword,
  StaticKeyword,
  ExportKeyword,
  DefaultKeyword,
  ExtendsKeyword,
  NumericLiteral,
  DeclareKeyword,
} = ts.SyntaxKind;

const { Readonly: CheckFlagReadonly } = ts.CheckFlags;
const { Readonly: ModifierFlagReadonly } = ts.ModifierFlags;
const { Const } = ts.NodeFlags;
const { Interface, TypeAlias, Alias, ExportValue } = ts.SymbolFlags;
const { every, some, getCheckFlags, getDeclarationModifierFlagsFromSymbol } =
  ts;

export const { isLiteralExpression, isStringLiteralLike } = ts;

export const isVarConst = ({ flags }) => (flags & Const) !== 0;
export const isTrueKeyword = ({ kind }) => kind === TrueKeyword;
export const isFalseKeyword = ({ kind }) => kind === FalseKeyword;
export const isStaticKeyword = ({ kind }) => kind === StaticKeyword;
export const isDeclareKeyword = ({ kind }) => kind === DeclareKeyword;

export const isAnyType = ({ flags }) => (flags & flagAny) !== 0;
export const isNullType = ({ flags }) => (flags & flagNull) !== 0;
export const isEnumType = ({ flags }) => (flags & flagEnumLike) !== 0;
export const isLiteralType = ({ flags }) => (flags & flagLiteral) !== 0;
export const isNumberType = ({ flags }) => (flags & flagNumberLike) !== 0;
export const isStringType = ({ flags }) => (flags & flagStringLike) !== 0;
export const isBooleanType = ({ flags }) => (flags & flagBooleanLike) !== 0;
export const isBigIntType = ({ flags }) => (flags & flagBigIntLike) !== 0;
export const isUndefinedType = ({ flags }) => (flags & flagUndefined) !== 0;
export const isNotUndefinedType = ({ flags }) => (flags & flagUndefined) === 0;
export const isNonPrimitiveType = ({ flags }) =>
  (flags & flagNonPrimitive) !== 0;

export const isObjectType = ({ flags, types }) =>
  (flags & ObjectFlagsType) !== 0 &&
  (flags & flagAny) === 0 &&
  (flags & flagNull) === 0 &&
  (!types || every(types, isObjectType));

export const isLiteralTypeOrNullType = type =>
  isLiteralType(type) || isNullType(type);

export const hasAnyType = type =>
  isAnyType(type) || some(type.types, hasAnyType);
export const hasNullType = type =>
  isNullType(type) || some(type.types, hasNullType);
export const hasNumberType = type =>
  isNumberType(type) || some(type.types, hasNumberType);
export const hasStringType = type =>
  isStringType(type) || some(type.types, hasStringType);
export const hasBooleanType = type =>
  isBooleanType(type) || some(type.types, hasBooleanType);
export const hasBigIntType = type =>
  isBigIntType(type) || some(type.types, hasBigIntType);
export const hasUndefinedType = type =>
  isUndefinedType(type) || some(type.types, hasUndefinedType);

export const isTypeAsValues = ({ types }) =>
  !!types && every(types, isLiteralTypeOrNullType);

export const isTupleType = type => host.checker.isTupleType(type);
export const isArrayLikeType = type => host.checker.isArrayLikeType(type);

export const isObjectNode = node =>
  isObjectType(host.checker.getTypeAtLocation(node));

export const isNullableType = type =>
  (type.flags & flagAny) !== 0 ||
  (type.flags & flagNull) !== 0 ||
  (type.flags & flagUndefined) !== 0 ||
  (type.flags & flagUnknown) !== 0 ||
  (type.flags & flagNever) !== 0 ||
  (type.flags & flagVoidLike) !== 0 ||
  type !== host.checker.getNonNullableType(type);

export const isVoidLikeType = type => (type.flags & flagVoidLike) !== 0;

export const isReadonlySymbol = symbol =>
  (getCheckFlags(symbol) & CheckFlagReadonly) !== 0 ||
  (getDeclarationModifierFlagsFromSymbol(symbol) & ModifierFlagReadonly) !== 0;

export const isReadonly = node =>
  isReadonlySymbol(host.checker.getSymbolAtLocation(node));

export const isDeclareSymbol = symbol =>
  some(symbol.valueDeclaration?.modifiers, isDeclareKeyword);

export const getSymbolOfNode = node => host.checker.getSymbolAtLocation(node);

export const isTypeSymbol = ({ flags }) =>
  (flags & TypeAlias) !== 0 || (flags & Interface) !== 0;

export const isAliasSymbol = symbol => (symbol.flags & Alias) !== 0;
export const isExportSymbol = symbol => (symbol.flags & ExportValue) !== 0;
export const isExportKeyword = ({ kind }) => kind === ExportKeyword;
export const isExportNode = node => some(node.modifiers, isExportKeyword);
export const isExtendsToken = ({ token }) => token === ExtendsKeyword;
export const isNotThisIdentifier = node => node.escapedText !== 'this';
export const isNotThisParameter = node => isNotThisIdentifier(node.name);

export function isNativeModifier({ kind }) {
  switch (kind) {
    case Decorator:
    case ExportKeyword:
    case StaticKeyword:
    case DefaultKeyword:
      return true;
  }
  return false;
}

export const getOriginSymbol = symbol =>
  symbol
    ? isAliasSymbol(symbol)
      ? host.checker.getAliasedSymbol(symbol)
      : isExportSymbol(symbol)
      ? host.checker.getExportSymbolOfSymbol(symbol)
      : symbol
    : symbol;

export const getOriginSymbolOfNode = node =>
  getOriginSymbol(host.checker.getSymbolAtLocation(node));

export const getFullName = symbol =>
  host.checker.getFullyQualifiedName(
    isAliasSymbol(symbol) ? host.checker.getAliasedSymbol(symbol) : symbol
  );

export const getTypeOfNode = node => host.checker.getTypeAtLocation(node);
export const getTypeOfSymbol = symbol => host.checker.getTypeOfSymbol(symbol);
export const getTypeOfTypeNode = node => host.checker.getTypeFromTypeNode(node);

export const getUnionType = types => host.checker.getUnionType(types);
export const getAwaitedType = type => host.checker.getAwaitedType(type);
export const getBaseType = type => host.checker.getBaseTypeOfLiteralType(type);
export const getIndexTypeOfType = type => host.checker.getIndexTypeOfType(type);
export const getNonNullableType = type => host.checker.getNonNullableType(type);
export const getIndexInfoOfType = type => host.checker.getIndexInfoOfType(type);

export const typeToString = type => host.checker.typeToString(type);

export const getNonUndefinedType = type =>
  getUnionType(type.types.filter(isNotUndefinedType));

export const getPropertiesOfType = type =>
  host.checker.getPropertiesOfType(type);

export const getPropertiesOfTypeNode = node =>
  getPropertiesOfType(getTypeOfTypeNode(node));

export const getExportsOfModule = node =>
  host.checker.getExportsOfModule(getSymbolOfNode(node));

export const getReturnType = node =>
  host.checker.getReturnTypeOfSignature(
    host.checker.getSignatureFromDeclaration(node)
  );

export function getInternalClassOfExtends(node) {
  node = node.heritageClauses?.find(isExtendsToken);

  if (node) {
    const symbol = getOriginSymbolOfNode(node.types[0].expression);

    if (symbol)
      return declarations.has(symbol)
        ? declarations.get(symbol)
        : getInternalClassOfExtends(symbol.valueDeclaration);
  }
}
