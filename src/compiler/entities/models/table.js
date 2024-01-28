import ts from 'typescript';

import { host } from '../../host.js';
import { factoryStaticProperty, updateClass } from '../../helpers/class.js';
import { MetaType } from '../../helpers/types.js';
import {
  getTypeOfNode,
  isBigIntType,
  isBooleanType,
  isNeverType,
  isObjectType,
  isNumberType,
  isStringType,
} from '../../helpers/checker.js';
import { makeFieldValidate } from '../../helpers/validator.js';
import { factoryObjectOfMap, factoryProperty } from '../../helpers/object.js';

import { PATH_SRC } from '../../../config.js';

export const { PropertyDeclaration } = ts.SyntaxKind;

export const tableModels = new WeakMap();

const getSqlType = meta =>
  meta.sqlType
    ? meta.sqlType
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

  for (let i = 0; i < links.length; i++)
    if (tableModels.has(links[i].node)) {
      const { node, key } = links[i];
      const { name } = tableModels.get(node);

      ref += 'REFERENCES ' + name + '("' + key + '") ';
      ref += 'ON UPDATE cascade ON DELETE cascade';
    }

  return ref;
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
    const meta = MetaType.create(symbol.valueDeclaration);

    if (isNeverType(meta.type)) {
      continue;
    }

    model.columns.set(meta.name, {
      name: meta.name,
      type: getSqlType(meta),
      default: meta.defaultValue,
      isNotNull: !meta.isNullable,
      references: getTableReferences(meta.links),
    });

    model.fields.set(meta.name, [
      factoryProperty('validate', makeFieldValidate(meta)),
    ]);
  }

  node = host.visitEachChild(node);

  return updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    factoryStaticProperty('fields', factoryObjectOfMap(model.fields)),
    ...node.members,
  ]);
}
