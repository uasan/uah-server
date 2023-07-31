import ts from 'typescript';
import { factoryLiteral, getConstantLiteral } from './expression.js';
import { host, types } from '../host.js';
import {
  getOriginSymbolOfNode,
  getTypeOfTypeNode,
  isLiteralTypeOrNullType,
} from './checker.js';
import { getRefValue } from './refs.js';
import { stringify } from '../../runtime/types/json.js';

const {
  TypeQuery,
  ArrayType,
  UnionType,
  LiteralType,
  TypeReference,
  IntersectionType,
  IndexedAccessType,
  ParenthesizedType,
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
  getRefValue(stringify(types.map(getValueOfLiteralType)));

export function getValueOfTypeNode(node) {
  switch (node.kind) {
    case LiteralType:
      return factoryLiteral(getValueOfLiteralType(getTypeOfTypeNode(node)));

    case TypeQuery:
      return node.exprName;

    case IndexedAccessType:
      return;
  }

  const type = getTypeOfTypeNode(node);

  if (isLiteralTypeOrNullType(type)) {
    return factoryLiteral(getValueOfLiteralType(type));
  }

  switch (node.kind) {
    case TypeQuery:
      return node.exprName;

    case TypeReference:
      return getConstantLiteral(node) ?? getValueOfTypeNode(node.typeName);

    case IndexedAccessType:
      return;
  }
}

function makeIndexedAccess(context, node) {
  const symbol = getOriginSymbolOfNode(node.objectType.typeName);

  let { members } = symbol;

  if (symbol.valueDeclaration) {
    //console.info(symbol.valueDeclaration);
  }

  const field = members.get(node.indexType.literal.text).declarations[0];

  return field;
}

function makeType(context, node) {
  switch (node?.kind) {
    case TypeReference:
      {
        const symbol = getOriginSymbolOfNode(node.typeName);

        if (types.has(symbol)) {
          types.get(symbol).make(context, node.typeArguments);
        } else {
          const typeNode = symbol.declarations?.[0]?.type;
          makeType(context, typeNode);
        }
      }
      break;

    case ArrayType:
      context.child = makeTypeContext(node.elementType);
      break;

    case ParenthesizedType:
      makeType(context, node.type);
      break;

    case UnionType:
    case IntersectionType:
      for (const unitType of node.types) {
        makeType(context, unitType);
      }
      break;

    case IndexedAccessType:
      makeType(context, makeIndexedAccess(context, node).type);
      break;
  }
}

export function makeTypeContext(node) {
  const context = {
    child: null,
    isOptional: false,
    defaultValue: null,
    validators: new Set(),
  };

  makeType(context, node);
  return context;
}
