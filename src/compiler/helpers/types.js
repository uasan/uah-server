import ts from 'typescript';
import { factoryLiteral, getConstantLiteral } from './expression.js';
import { host, types } from '../host.js';
import {
  getNonNullableType,
  getNonUndefinedType,
  getOriginSymbolOfNode,
  getTypeOfNode,
  getTypeOfTypeNode,
  hasNullType,
  hasUndefinedType,
  isLiteralTypeOrNullType,
} from './checker.js';
import { getRefValue } from './refs.js';
import { stringify } from '../../runtime/types/json.js';
import { Validator } from '../makers/types/validator.js';

const {
  RestType,
  TypeQuery,
  ArrayType,
  TupleType,
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

function makeMetaType(meta, node) {
  switch (node?.kind) {
    case TypeReference:
      {
        const symbol = getOriginSymbolOfNode(node.typeName);

        if (types.has(symbol)) {
          types.get(symbol).make(meta, node.typeArguments);
        } else {
          const typeNode = symbol.declarations?.[0]?.type;
          makeMetaType(meta, typeNode);
        }
      }
      break;

    case ArrayType:
      meta.add(node.elementType);
      break;

    case TupleType:
      for (const element of node.elements) {
        meta.add(element);
      }
      break;

    case RestType:
    case ParenthesizedType:
      makeMetaType(meta, node.type);
      break;

    case UnionType:
    case IntersectionType:
      for (const unitType of node.types) {
        makeMetaType(meta, unitType);
      }
      break;

    case IndexedAccessType:
      makeMetaType(meta, makeIndexedAccess(meta, node).type);
      break;
  }
}

export function getPayloadValidator(node) {
  return (node && types.get(getOriginSymbolOfNode(node.typeName))) || Validator;
}

export class MetaType {
  name = '';
  type = null;

  sqlType = '';
  children = [];

  isBinary = false;
  isNullable = false;
  isOptional = false;

  defaultValue = null;
  validators = new Set();

  constructor(node) {
    makeMetaType(this, node);
  }

  add(node) {
    this.children.push(new MetaType(node));
  }

  static create(node) {
    const self = new this(node.type);

    self.type = getTypeOfNode(node);
    self.name = node.name.escapedText;

    if (hasNullType(self.type)) {
      self.isNullable = true;
      self.type = getNonNullableType(self.type);
    }

    if (hasUndefinedType(self.type)) {
      self.isOptional = true;
      self.type = getNonUndefinedType(self.type);
    }

    if (node.initializer) {
      self.isOptional = true;
      self.defaultValue = node.initializer;
    }

    return self;
  }
}
