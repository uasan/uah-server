import ts from 'typescript';

import { host } from '../../host.js';
import { factoryString } from '../../helpers/expression.js';
import {
  factoryStaticProperty,
  isFieldProperty,
  updateClass,
} from '../../helpers/class.js';
import { MetaType } from '../../helpers/types.js';
import {
  isBooleanType,
  isNonPrimitiveType,
  isNumberType,
  isStringType,
} from '../../helpers/checker.js';
import { makeFieldValidate } from '../../helpers/validator.js';
import { factoryObjectOfMap, factoryProperty } from '../../helpers/object.js';
import { setSchema } from '../migrations/maker.js';
import { createTableMigration } from '../migrations/table.js';

export const { PropertyDeclaration } = ts.SyntaxKind;

const getSqlType = meta =>
  meta.sqlType
    ? meta.sqlType
    : isStringType(meta.type)
    ? 'text'
    : isNumberType(meta.type)
    ? 'int'
    : isBooleanType(meta.type)
    ? 'boolean'
    : isNonPrimitiveType(meta.type)
    ? 'jsonb'
    : 'text';

export function TableModel(node, options) {
  const { model } = host.entity;

  if (!model || !options) {
    return host.visitEachChild(node);
  }

  model.fields = new Map();
  model.columns = new Map();
  model.tableName = setSchema(options.get('name').value);
  model.name = model.tableName.replaceAll('"', '');

  for (const member of node.members.filter(isFieldProperty)) {
    const meta = MetaType.create(member);

    model.columns.set(meta.name, {
      name: meta.name,
      type: getSqlType(meta),
      default: meta.defaultValue,
      isNotNull: !meta.isNullable,
    });

    model.fields.set(meta.name, [
      factoryProperty('validate', makeFieldValidate(meta)),
    ]);
  }

  createTableMigration(model);
  node = host.visitEachChild(node);

  return updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    factoryStaticProperty('tableName', factoryString(model.name)),
    factoryStaticProperty('fields', factoryObjectOfMap(model.fields)),
    ...node.members,
  ]);
}
