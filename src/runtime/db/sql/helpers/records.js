import { SQL } from '../sql.js';

export function records(values, model) {
  return new SQL(
    [
      model
        ? 'json_populate_recordset(NULL::' + (model.tableName || model) + ', '
        : 'json_to_recordset(',
      '::json)',
    ],
    [values]
  );
}
