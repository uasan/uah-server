import ts from 'typescript';
import { typeNames } from '../makers/types/names.js';
import { factoryElementAccess, factoryPropertyAccess } from './object.js';
import {
  factoryIdentifier,
  factoryLiteral,
  factoryNumber,
  factoryString,
  getConstantLiteral,
} from './expression.js';
import { host, types } from '../host.js';
import {
  getOriginSymbolOfNode,
  getTypeOfNode,
  getTypeOfSymbol,
  getTypeOfTypeNode,
  isLiteralType,
  isLiteralTypeOrNullType,
  isObjectType,
} from './checker.js';
import { getRefValue } from './refs.js';
import { stringify } from '../../runtime/types/json.js';

const {
  TypeQuery,
  TypeOperator,
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

function makeType(context, node) {
  switch (node?.kind) {
    case TypeReference:
      const symbol = getOriginSymbolOfNode(node.typeName);

      if (types.has(symbol)) {
        types.get(symbol).make(context, node.typeArguments);
      } else {
        const typeNode = symbol.declarations?.[0]?.type;
        // if (symbol.name === 'Payload1') {
        //   console.log(
        //     host.checker.typeToString(getTypeOfNode(symbol.declarations?.[0]))
        //   );
        // }
        makeType(context, typeNode);
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
  }
}

export function makeTypeContext(node) {
  const context = {
    child: null,
    defaultValue: null,
    validators: new Set(),
  };

  makeType(context, node);
  return context;
}
