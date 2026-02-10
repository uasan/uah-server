import { Validator } from '../../../types/validator.js';
import { isRelations, addRelation } from './relations.js';
import { hasOwn, isObject } from '../../../types/checker.js';
import { errorFieldUndefined, errorNotObject } from './errors.js';

export function makeInsert(patch, row) {
  let values = '';
  let columns = '';

  let countPrimary = 0;
  const { primary } = patch.model.table;

  if (!isObject(row)) {
    throw errorNotObject('add[...]');
  }

  Validator.set(row);

  for (const key in row) {
    if (isRelations(patch, key)) {
      addRelation(patch, key, row[key]);
    } else if (hasOwn(patch.model.fields, key)) {
      patch.model.fields[key].validate(Validator);

      if (values) {
        values += ', ';
        columns += ', ';
      }

      if (primary.includes(key)) countPrimary++;

      columns += '"' + key + '"';
      values += '$' + patch.params.push(row[key]);
    } else {
      throw errorFieldUndefined(patch.model, key);
    }
  }

  Validator.validate();

  if (primary.length > countPrimary) {
    patch.returning.push(patch.queries.length);
  }

  patch.queries.push(
    'INSERT INTO ' +
      patch.model.table.name +
      '(' +
      columns +
      ')\nVALUES (' +
      values +
      ')\nRETURNING "' +
      patch.model.table.primary.join('", "') +
      '"',
  );
}
