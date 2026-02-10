import { Validator } from '../../../types/validator.js';
import { hasOwn, isObject } from '../../../types/checker.js';

import { errorFieldUndefined, errorNotObject } from './errors.js';
import { makeReturning, makeSubPatch, makeWere } from './query.js';
import { isRelations, setRelation } from './relations.js';

export function makeUpdate(patch, { path, value, patches }) {
  let set = '';
  const { table, fields } = patch.model;

  if (value) {
    if (!isObject(value)) errorNotObject('set.value');

    Validator.set(value);

    for (const key in value) {
      if (hasOwn(fields, key)) {
        fields[key].validate(Validator);

        if (set) set += ', ';
        set += '"' + key + '"=' + '$' + patch.params.push(value[key]);
      } else {
        throw errorFieldUndefined(patch.model, key);
      }
    }

    Validator.validate();
  }

  if (patches) {
    if (!isObject(patches)) throw errorNotObject('set.patches');

    for (const key in patches)
      if (isRelations(patch, key)) {
        setRelation(patch, key, patches[key]);
      } else if (hasOwn(fields, key)) {
        if (set) set += ', ';
        set += makeSubPatch(patch, key, patches[key]);
      } else {
        throw errorFieldUndefined(patch.model, key);
      }
  }

  if (set) set += ', ';
  set += '"updatedAt"=CURRENT_TIMESTAMP';

  patch.queries.push(
    'UPDATE ' +
      table.name +
      '\nSET ' +
      set +
      makeWere(patch, path) +
      makeReturning(patch),
  );
}
