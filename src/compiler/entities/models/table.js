import ts from 'typescript';

import {
  getTypeOfNode,
  hasDeclareModifier,
  isBigIntType,
  isBooleanType,
  isNeverType,
  isNumberType,
  isObjectType,
  isStringType,
} from '../../helpers/checker.js';
import { factoryStaticProperty, updateClass } from '../../helpers/class.js';
import { factoryObjectOfMap, factoryProperty } from '../../helpers/object.js';
import { MetaType } from '../../helpers/types.js';
import { makeFieldValidate } from '../../helpers/validator.js';
import { host } from '../../host.js';

import { PATH_SRC } from '../../../config.js';

export const { PropertyDeclaration } = ts.SyntaxKind;

export const tableModels = new WeakMap();

const getSqlType = meta =>
  meta.sql.type
    ? meta.sql.type
    : isStringType(meta.type)
    ? 'text'
    : isBigIntType(meta.type)
    ? 'bigint'
    : isNumberType(meta.type)
    ? 'float8'
    : isBooleanType(meta.type)
    ? 'boolean'
    : isObjectType(meta.type)
    ? 'jsonb'
    : 'text';

function getTableReferences(links) {
  let ref = '';

  for (let i = 0; i < links.length; i++) {
    if (tableModels.has(links[i].node)) {
      const { node, key } = links[i];
      const { name } = tableModels.get(node);

      ref += 'REFERENCES ' + name + '("' + key + '") ';
      ref += 'ON UPDATE cascade ON DELETE cascade';
    }
  }

  return ref;
}

class MetaTypeSQL extends MetaType {
  sql = {
    type: '',
    length: 0,
  };
}

export function TableModel(node) {
  const { model } = host.entity;

  if (!model) {
    return host.visitEachChild(node);
  }

  tableModels.set(node, model);

  model.fields = new Map();
  model.columns = new Map();
  model.comment = host.entity.path.slice(PATH_SRC.length);

  for (const symbol of getTypeOfNode(node).properties) {
    const meta = MetaTypeSQL.create(symbol.valueDeclaration);

    if (hasDeclareModifier(symbol.valueDeclaration)) {
      switch (meta.name) {
        case 'relations':
          console.log(meta.name, symbol.flags);
      }
    } else if (!isNeverType(meta.type)) {
      model.columns.set(meta.name, {
        name: meta.name,
        type: getSqlType(meta),
        default: meta.defaultValue,
        references: getTableReferences(meta.links),
        isNotNull: !meta.isNullable && !meta.isUndefined,
      });

      model.fields.set(meta.name, [
        factoryProperty('validate', makeFieldValidate(meta)),
      ]);
    }
  }

  node = host.visitEachChild(node);

  return updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    factoryStaticProperty('fields', factoryObjectOfMap(model.fields)),
    ...node.members,
  ]);
}
