import { Validator } from '../../../types/validator.js';
import { isArray, isObject } from '../../../types/checker.js';
import { errorNotArray, errorNotObject } from './errors.js';
import { concatJSONB, deleteJSONB, setJSONB } from './jsonb.js';

export function makeQuery({ queries }) {
  if (queries.length === 1) {
    return queries[0];
  }

  let cte = '';
  let select = '';

  for (let i = 0; i < queries.length; i++) {
    if (cte) {
      cte += ',\n';
      select += '\nUNION\n';
    } else {
      cte = 'WITH ';
    }

    cte += '"' + i + '" AS (\n' + queries[i] + ')';
    select += 'SELECT * FROM "' + i + '"';
  }

  return cte + '\n' + select;
}

export function makeWere({ params, model }, path) {
  let sql = '';
  const { primary } = model.table;

  if (!isArray(path)) throw errorNotArray('path');

  for (let i = 0; i < primary.length; i++) {
    if (sql) sql += ' AND ';
    sql += '"' + primary[i] + '"=$' + params.push(path[i]);
  }

  return '\nWHERE ' + sql;
}

export function makeReturning({ model }) {
  return '\nRETURNING "' + model.table.primary.join('", "') + '"';
}

export function makeSubPatch(patch, key, subPatch) {
  if (!isObject(subPatch)) {
    throw errorNotObject('set.patches.' + key);
  }

  let sql = '"' + key + '"';

  if (subPatch.delete) {
    if (!isArray(subPatch.delete)) {
      throw errorNotArray('set.patches.' + key + '.delete');
    }

    for (const value of subPatch.delete) {
      sql = deleteJSONB(patch, value, sql);
    }
  }

  if (subPatch.set) {
    if (!isArray(subPatch.set)) {
      throw errorNotArray('set.patches.' + key + '.set');
    }

    for (const value of subPatch.set) {
      if (!isObject(value)) {
        throw errorNotObject('set.patches.' + key + '[]');
      }

      sql = setJSONB(patch, value, sql);
    }
  }

  if (subPatch.assign) {
    if (!isObject(subPatch.assign)) {
      throw errorNotObject('set.patches.' + key + '.assign');
    }

    Validator.set({ [key]: subPatch.assign });
    patch.model.fields[key].validate(Validator).validate();
    sql = concatJSONB(patch, subPatch.assign, sql);
  }

  return '"' + key + '"=' + sql;
}
