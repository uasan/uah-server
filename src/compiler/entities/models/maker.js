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

export const models = new Set();
export const { PropertyDeclaration } = ts.SyntaxKind;

export function makeImportModels() {}

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

  model.name = options.get('name').value;
  model.fields = new Map();
  model.columns = new Map();

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

  node = host.visitEachChild(node);

  return updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    factoryStaticProperty('tableName', factoryString(model.name)),
    factoryStaticProperty('fields', factoryObjectOfMap(model.fields)),
    ...node.members,
  ]);
}
