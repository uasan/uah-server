import { Validator } from '../../../types/Validator.js';
import { validate } from './validate.js';
import { isRelations, addRelation } from './relations.js';

export function makeInsert(patch, value) {
  let values = '';
  let columns = '';

  Validator.of(value);

  for (const key in value) {
    if (isRelations(patch, key)) {
      addRelation(patch, key, value);
    } else {
      validate(patch, key);

      if (values) {
        values += ', ';
        columns += ', ';
      }

      columns += '"' + key + '"';
      values += '$' + patch.params.push(value[key]);
    }
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
      '"'
  );
}
