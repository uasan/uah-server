import { isFunction } from '../../types/checker.js';

export function concat(sql, source, values) {
  for (let i = 0; i < values.length; ) {
    if (isFunction(values[i]?.toSQL)) {
      sql.source[sql.source.length - 1] +=
        values[i].toSQL(sql.context) + source[++i];
    } else {
      sql.values.push(values[i]);
      sql.source.push(source[++i]);
    }
  }

  return sql;
}
