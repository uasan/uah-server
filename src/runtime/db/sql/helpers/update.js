import { SQL } from '../sql.js';
import { getAllKeys } from '../utils/set.js';

export function update(model, rows) {
  if (!rows?.length) return;

  const sql = this;
  const fields = [];
  const columns = getAllKeys(rows);
  const keys = Array.isArray(model.idColumn)
    ? model.idColumn
    : [model.idColumn];

  for (let i = 0; i < columns.length; i++)
    if (keys.includes(columns[i]) === false)
      fields.push(`"${columns[i]}"=_from."${columns[i]}"`);

  for (let i = 0; i < keys.length; i++)
    keys[i] = `_from."${keys[i]}"=_to."${keys[i]}"`;

  return sql`UPDATE ${model} AS _to SET
  ${new SQL(fields.join(',\n'))}
  FROM json_populate_recordset(NULL::${model}, ${rows}::json) AS _from
  WHERE ${new SQL(keys.join(' AND '))}`;
}
