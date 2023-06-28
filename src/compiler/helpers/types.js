import ts from 'typescript';
import { typeNames } from '../makers/types/names.js';
import { factoryElementAccess, factoryPropertyAccess } from './object.js';
import {
  factoryIdentifier,
  factoryNumber,
  factoryString,
  getConstantLiteral,
} from './expression.js';
import { host, types } from '../host.js';
import { getOriginSymbolOfNode } from './checker.js';
import { getRefValue } from './refs.js';

const {
  TypeQuery,
  TypeOperator,
  UnionType,
  LiteralType,
  TypeReference,
  IntersectionType,
  IndexedAccessType,
} = ts.SyntaxKind;

export const getValueOfLiteralType = type =>
  type.value ??
  (type === host.checker.getTrueType()
    ? true
    : type === host.checker.getFalseType()
    ? false
    : type === host.checker.getNullType()
    ? null
    : undefined);

export const getRefForLiteralTypes = ({ types }) =>
  getRefValue(types.map(getValueOfLiteralType).sort());

export function getValueOfType(node) {
  switch (node.kind) {
    case LiteralType:
      return node.literal;

    case TypeQuery:
      return node.exprName;

    case TypeReference:
      //console.log(host.checker.getConstantValue(node));
      return getConstantLiteral(node) ?? getValueOfType(node.typeName);

    case IndexedAccessType:
      return;

    case TypeOperator:
      return getValueOfType(node.type);
  }
}

const getMakerByTypeName = ({ typeName }) =>
  types.get(getOriginSymbolOfNode(typeName));

function makeType(context, typeNode) {
  switch (typeNode.kind) {
    case TypeReference:
      getMakerByTypeName(typeNode)?.make(context, typeNode.typeArguments);
      break;

    case UnionType:
    case IntersectionType:
      for (const unitType of typeNode.types) {
        makeType(context, unitType);
      }
      break;
  }
}

export function makeTypeContext(symbol) {
  const context = {
    defaultValue: null,
    validators: new Map(),
  };

  makeType(context, symbol.valueDeclaration.type);
  return context;
}
