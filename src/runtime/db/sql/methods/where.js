import { SQL } from '../sql.js';
import { SetSQL } from '../utils/set.js';
import { isArray, isObject } from '../../../utils/native.js';

const options = {
  startWith: '\nWHERE ',
  separator: ' AND ',
};

export function where(...params) {
  const sql = new SetSQL(this, options);

  for (const param of params)
    if (isObject(param))
      if (param instanceof SQL) sql.set('', param);
      else
        for (const key in param) {
          const value = param[key];

          if (value !== undefined) {
            if (value === null) {
              sql.set(key + ' IS NULL');
            } else if (isArray(value)) {
              sql.set(key + ' = ANY(', value, ')');
            } else {
              sql.set(key + ' = ', value);
            }
          }
        }

  return this;
}
