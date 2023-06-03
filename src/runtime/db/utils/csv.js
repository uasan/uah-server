import { once } from 'events';
import { randomUUID } from 'crypto';
import { copyFrom } from '#db/copy.js';
import { trimQuote } from '#utils/string.js';
import { getFileStream, getFileLine } from '#utils/file.js';

export const copyFromFile = async (context, table, path) => {
  const columns = (await getFileLine(path)).split(',').map(trimQuote);

  const stream = await copyFrom(
    context,
    `COPY ${table} ("${columns.join('","')}") FROM STDIN WITH(
      FORMAT csv, HEADER true, DELIMITER ','
    )`
  );

  await once(getFileStream(path).pipe(stream), 'finish');
  return { columns };
};

export const upsertFromFile = async (context, table, path, keys) => {
  const { sql } = context;
  const tempTable = sql('"' + randomUUID() + '"');

  await sql`CREATE TEMP TABLE ${tempTable} (LIKE ${table})`;
  const { columns } = await copyFromFile(context, tempTable, path);

  const sqlColumns = sql('"' + columns.join('", "') + '"');

  const query = sql`
    INSERT INTO ${table} (${sqlColumns})
      SELECT ${sqlColumns} FROM ${tempTable} ON CONFLICT `;

  if (keys?.length) {
    const setColumns = columns
      .filter(name => !keys.includes(name))
      .map(name => `"${name}"=EXCLUDED."${name}"`)
      .join(', ');

    query.sql`("${sql(keys.join('", "'))}") DO UPDATE SET ${sql(setColumns)}`;
  } else {
    query.sql`DO NOTHING`;
  }

  await query;

  await sql`DROP TABLE ${tempTable}`;
};
