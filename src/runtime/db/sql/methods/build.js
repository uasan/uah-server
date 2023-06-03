import { isFunction } from '#utils/native.js';

import { SQL } from '../sql.js';
import { join } from '../utils/concat.js';

const parts = {
  with: { start: '\nWITH ', separator: ',' },
  withRecursive: { start: '\nWITH RECURSIVE ', separator: ',' },
  select: { start: '\nSELECT ', separator: ',' },
  from: { start: '\n', separator: '\n' },
  where: { start: '\nWHERE ', separator: ' AND ' },
  groupBy: { start: '\nGROUP BY ', separator: ',' },
  having: { start: '\nHAVING ', separator: ' AND ' },
  orderBy: { start: '\nORDER BY ', separator: ',' },
};

const commands = {
  'WITH RECURSIVE': parts.withRecursive,
  WITH: parts.with,
  SELECT: parts.select,
  FROM: parts.from,
  JOIN: parts.from,
  'LEFT JOIN': parts.from,
  'INNER JOIN': parts.from,
  'RIGHT JOIN': parts.from,
  'CROSS JOIN': parts.from,
  'FULL JOIN': parts.from,
  WHERE: parts.where,
  'GROUP BY': parts.groupBy,
  HAVING: parts.having,
  'ORDER BY': parts.orderBy,
};

const keys = Object.keys(commands);
const values = Object.values(parts).map((value, index) => {
  value.index = index;
  return value;
});

const makeSQL = (queries, strings, params) => {
  if (strings.raw) {
    const string = strings[0].trimStart();

    for (const key of keys)
      if (string.startsWith(key)) {
        if (commands[key] !== parts.from) {
          strings = [...strings];
          strings[0] = string.slice(key.length).trimStart();
        }

        const query = new SQL(strings, params);
        queries[commands[key].index].push(query);
        return query;
      }
  }

  return new SQL(strings, params);
};

export function build(params, actions) {
  const queries = [[], [], [], [], [], [], [], []];
  const sql = (strings, ...params) => makeSQL(queries, strings, params);

  const context = Object.create(this.context);
  context.sql = Object.assign(sql, this.context.sql);

  for (const action of actions) {
    if (isFunction(action)) action(context, params);
  }

  for (let i = 0; i < queries.length; i++)
    if (queries[i].length)
      join(this, values[i].start, queries[i], values[i].separator);

  return this;
}
