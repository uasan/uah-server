import ts from 'typescript';

import { host } from '../../host.js';
import { factoryString } from '../../helpers/expression.js';
import {
  factoryStaticMethod,
  factoryStaticProperty,
  isFieldProperty,
  updateClass,
} from '../../helpers/class.js';
import { MetaType } from '../../helpers/types.js';
import {
  isBigIntType,
  isBooleanType,
  isNonPrimitiveType,
  isNumberType,
  isStringType,
} from '../../helpers/checker.js';
import { makeFieldValidate } from '../../helpers/validator.js';
import { factoryObjectOfMap, factoryProperty } from '../../helpers/object.js';
import { setSchema } from '../migrations/maker.js';
import { createTableMigration } from '../migrations/table.js';
import { PATH_SRC } from '../../../config.js';

export const { PropertyDeclaration } = ts.SyntaxKind;

const tableModels = new WeakMap();

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
    : isNonPrimitiveType(meta.type)
    ? 'jsonb'
    : 'text';

function makeToSQL(model) {
  return factoryStaticMethod(
    'toSQL',
    [],
    [host.factory.createReturnStatement(factoryString(model.tableName))]
  );
}

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

export function TableModel(node, options) {
  const { model } = host.entity;

  if (!model || !options) {
    return host.visitEachChild(node);
  }

  tableModels.set(node, model);

  model.fields = new Map();
  model.columns = new Map();
  model.comment = host.entity.path.slice(PATH_SRC.length);
  model.tableName = setSchema(options.get('name').value);
  model.name = model.tableName.replaceAll('"', '');

  for (const member of node.members.filter(isFieldProperty)) {
    const meta = MetaType.create(member);

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

  createTableMigration(model);
  node = host.visitEachChild(node);

  return updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    makeToSQL(model),
    factoryStaticProperty('fields', factoryObjectOfMap(model.fields)),
    ...node.members,
  ]);
}
