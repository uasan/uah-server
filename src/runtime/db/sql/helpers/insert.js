import { getAllKeys } from '../utils/set.js';

export function insert(model, rows, query) {
  if (!rows?.length) return;

  const sql = this;
  const columns = sql('"' + getAllKeys(rows).join('", "') + '"');

  return sql`INSERT INTO ${model}(${columns})
    SELECT ${columns} FROM json_populate_recordset(NULL::${model}, ${rows}::json) ${query}`;
}
