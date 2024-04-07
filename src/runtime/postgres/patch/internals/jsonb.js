import { isArray } from '../../../types/checker.js';
import { errorFieldUndefined, errorNotArray } from './errors.js';

export function setJSONB({ params }, { path, value }, sql) {
  if (!isArray(path)) throw errorNotArray('path');
  if (value === undefined) throw errorFieldUndefined('value');

  return (
    'jsonb_set(' +
    sql +
    ', $' +
    params.push(path) +
    ', $' +
    params.push(value) +
    ')'
  );
}

export function concatJSONB({ params }, value, sql) {
  return sql + ' || $' + params.push(value);
}

export function deleteJSONB({ params }, path, sql) {
  if (!isArray(path)) throw errorNotArray('path');

  return '(' + sql + ' - $' + params.push(path) + '::text[])';
}
