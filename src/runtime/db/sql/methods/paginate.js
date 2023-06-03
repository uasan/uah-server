import { RESULT_ONE_VALUE } from '../constants.js';
import { sql } from '../sql.js';

const LIMIT = 10;

const addQueries = queries => {
  const query = sql`,`;

  for (const key of Object.keys(queries))
    query
      .sql("'" + key + "',(")
      .sql(queries[key])
      .sql(')');

  return query;
};

export function paginate({ page = 1, limit = LIMIT }, queries) {
  if (page < 1) page = 1;
  if (limit < 1) limit = LIMIT;

  const offset = page > 1 ? (page - 1) * limit : 0;

  this.result = RESULT_ONE_VALUE;

  return this.overwrite(
    sql`WITH "all" AS(${this})
    SELECT json_build_object(
      'page', ${page}::int,
      'limit', ${limit}::int,
      'count', (SELECT count(*)::int FROM "all"),
      'entities', (SELECT json_agg(_.*) FROM (SELECT * FROM "all" LIMIT ${limit} OFFSET ${offset}) _)
      ${queries && addQueries(queries)}
    ) AS "0"`
  );
}
