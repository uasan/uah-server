import { once } from 'events';
import { addAbortSignal } from 'stream';
import { createClient } from './client.js';
import { signal } from '#utils/process.js';
import { makeError } from './utils/errors.js';
import { inlineSQL } from './utils/text.js';

export const copyTo = async ({ db }, query) =>
  addAbortSignal(signal, await db.unsafe(query).readable());

export const copyFrom = async ({ db }, query) =>
  addAbortSignal(signal, await db.unsafe(query).writable());

export const respondToFile = async (context, { fileName, query }) => {
  const meta = fileName.endsWith('.csv')
    ? { delimiter: ',', type: 'text/csv; charset=utf-8' }
    : { delimiter: '\t', type: 'text/tab-separated-values; charset=utf-8' };

  const stream = await copyTo(
    context,
    `COPY (${await inlineSQL(query)}) TO STDOUT WITH(
      FORMAT csv,
      HEADER true,
      DELIMITER '${meta.delimiter}')`
  );

  return context.respondStream({
    fileName,
    stream,
    compress: false,
    type: meta.type,
  });
};

export const copyFromLink = async (ctx, link, tables) => {
  link = { db: createClient(link) };

  await ctx.sql`SET session_replication_role = 'replica'`;

  try {
    for (const table of tables) {
      const source = `COPY ${table.source} TO STDOUT`;
      const target = `COPY ${table.target} FROM STDIN`;
      await once(
        (await copyTo(link, source)).pipe(await copyFrom(ctx, target)),
        'finish'
      );
    }
  } catch (error) {
    throw makeError(error);
  } finally {
    await link.db.end({ timeout: 0 });
  }

  await ctx.sql`SET session_replication_role = 'origin'`;
  await ctx.sql`ANALYZE (SKIP_LOCKED)`;
};
