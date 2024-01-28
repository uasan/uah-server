import ts from 'typescript';
import { types } from '../host.js';
import {
  getNonNullableType,
  getNonUndefinedType,
  getOriginSymbolOfNode,
  getTypeOfNode,
  getTypeOfTypeNode,
  hasNullType,
  hasUndefinedType,
} from './checker.js';

import { DateLike } from '../makers/types/validators/DateLike.js';
import { BinaryData } from '../makers/types/validators/BinaryData.js';

const {
  RestType,
  ArrayType,
  TupleType,
  UnionType,
  TypeReference,
  IntersectionType,
  IndexedAccessType,
  ParenthesizedType,
} = ts.SyntaxKind;

function makeIndexedAccess(meta, node) {
  const symbol = getOriginSymbolOfNode(node.objectType.typeName);

  if (symbol.valueDeclaration) {
    meta.links.push({
      node: symbol.valueDeclaration,
      key: node.indexType.literal.text,
    });
  }

  return symbol.members.get(node.indexType.literal.text).declarations[0];
}

function makeMetaType(meta, node) {
  switch (node.kind) {
    case TypeReference:
      {
        const symbol = getOriginSymbolOfNode(node.typeName);

        if (types.has(symbol)) {
          types.get(symbol).make(meta, node.typeArguments);
        } else if (meta.isBinary === false) {
          const typeNode = symbol.declarations?.[0]?.type;

          if (typeNode) {
            makeMetaType(meta, typeNode);
          }
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

export class MetaType {
  name = '';
  node = null;
  type = null;
  defaultValue = null;

  sqlType = '';
  numberType = '';

  isNullable = false;
  isOptional = false;

  isBlob = false;
  isFile = false;
  isUUID = false;
  isBinary = false;
  isStream = false;
  isDateLike = false;
  isBufferStream = false;

  byteLength = 0;
  minByteLength = 0;
  maxByteLength = 0;

  links = [];
  children = [];
  validators = new Set();

  constructor(node, type = getNonNullableType(getTypeOfTypeNode(node))) {
    this.node = node;
    this.type = type;

    if (DateLike.isAssignable(type)) {
      this.isDateLike = true;
      this.sqlType = DateLike.sqlType;
    } else if (BinaryData.isAssignable(type)) {
      this.isBinary = true;
      this.sqlType = BinaryData.sqlType;
    }

    makeMetaType(this, node);
  }

  add(node) {
    this.children.push(new MetaType(node));
  }

  static create(node) {
    const self = new this(node.type, getTypeOfNode(node));

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
