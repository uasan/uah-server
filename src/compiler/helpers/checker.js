import ts from 'typescript';
import { host } from '../host.js';

export const {
  Any: flagAny,
  Null: flagNull,
  Never: flagNever,
  Object: flagObject,
  String: flagString,
  Number: flagNumber,
  Boolean: flagBoolean,
  Unknown: flagUnknown,
  Undefined: flagUndefined,
  VoidLike: flagVoidLike,
  StringLike: flagStringLike,
  NumberLike: flagNumberLike,
  BooleanLike: flagBooleanLike,
  ObjectFlagsType,
} = ts.TypeFlags;

const { TrueKeyword, FalseKeyword, NumericLiteral, DeclareKeyword } =
  ts.SyntaxKind;

const { Readonly: CheckFlagReadonly } = ts.CheckFlags;
const { Readonly: ModifierFlagReadonly } = ts.ModifierFlags;
const { Const } = ts.NodeFlags;
const { Alias, Type, ExportValue } = ts.SymbolFlags;
const { every, some, getCheckFlags, getDeclarationModifierFlagsFromSymbol } =
  ts;

export const isTrueKeyword = ({ kind }) => kind === TrueKeyword;
export const isFalseKeyword = ({ kind }) => kind === FalseKeyword;
export const isDeclareKeyword = ({ kind }) => kind === DeclareKeyword;

export const { isLiteralExpression, isStringLiteralLike } = ts;

export const isVarConst = ({ flags }) => (flags & Const) !== 0;

export const isObjectType = ({ flags, types }) =>
  (flags & ObjectFlagsType) !== 0 &&
  (flags & flagAny) === 0 &&
  (flags & flagNull) === 0 &&
  (!types || every(types, isObjectType));

export const isNumberType = ({ flags, types }) =>
  (flags & flagNumberLike) !== 0 || some(types, isNumberType);

export const isStringType = ({ flags, types }) =>
  (flags & flagStringLike) !== 0 || some(types, isStringType);

export const isBooleanType = ({ flags, types }) =>
  (flags & flagBooleanLike) !== 0 || some(types, isBooleanType);

export const isObjectNode = node =>
  isObjectType(host.checker.getTypeAtLocation(node));

export const isNumberNode = node =>
  node.kind === NumericLiteral ||
  isNumberType(host.checker.getTypeAtLocation(node));

export const isStringNode = node =>
  isStringLiteralLike(node) ||
  isStringType(host.checker.getTypeAtLocation(node));

export const isBooleanNode = node =>
  isTrueKeyword(node) ||
  isFalseKeyword(node) ||
  isBooleanType(host.checker.getTypeAtLocation(node));

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
  symbol.valueDeclaration.modifiers?.some(isDeclareKeyword) === true;

export const getSymbolOfNode = node => host.checker.getSymbolAtLocation(node);

export const getParamFromSymbol = symbol => {
  const type = host.checker.getTypeAtLocation(symbol.valueDeclaration);
  return {
    type,
    symbol,
    isNullableType: isNullableType(type),
  };
};

export const getParamsFromTypeNode = node =>
  host.checker
    .getTypeFromTypeNode(node)
    .getApparentProperties()
    .map(getParamFromSymbol);

export const isTypeSymbol = symbol => (symbol.flags & Type) !== 0;
export const isAliasSymbol = symbol => (symbol.flags & Alias) !== 0;
export const isExportSymbol = symbol => (symbol.flags & ExportValue) !== 0;

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

export const getReturnType = node =>
  host.checker.getReturnTypeOfSignature(
    host.checker.getSignatureFromDeclaration(node)
  );

export const getAwaitedType = type => host.checker.getAwaitedType(type);
