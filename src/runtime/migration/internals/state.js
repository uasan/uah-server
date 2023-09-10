import { ERRORS } from '@uah/postgres/src/constants.js';
import { STATUS_DONE, STATUS_NEW, STATUS_UPDATED } from '../constants.js';

async function createTableMigrations(ctx) {
  await ctx.sql`
    CREATE TABLE public.migrations (
      name text COLLATE "C" PRIMARY KEY,
      hash bytea,
      updated_at timestamptz not null default CURRENT_TIMESTAMP,
      created_at timestamptz not null default CURRENT_TIMESTAMP
    )`;
}

async function getStateMigrations(ctx, migrations) {
  const names = migrations.map(({ path }) => path);
  const hashes = migrations.map(({ hash }) => hash);

  const query = ctx.sql`
    SELECT json_object_agg(files.name, CASE
        WHEN migrations.name IS NULL THEN ${STATUS_NEW}
        WHEN migrations.hash IS DISTINCT FROM files.hash THEN ${STATUS_UPDATED}
        ELSE ${STATUS_DONE}
      END)
    FROM unnest(${names}::text[], ${hashes}::bytea[]) AS files(name, hash)
    LEFT JOIN public.migrations USING(name)`.asValue();

  try {
    return await query;
  } catch (error) {
    if (error.code === ERRORS.RELATION_NOT_EXIST) {
      await createTableMigrations(ctx);
      return await query;
    }
    throw error;
  }
}

export async function setMigrations(ctx, migrations) {
  const state = await getStateMigrations(ctx, migrations);

  ctx.isBootStrap = Object.values(state).every(status => status === STATUS_NEW);

  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];
    const status = state[migration.path];

    migration.wasDone = status === STATUS_DONE;

    migrations[i] = new migration();
    migrations[i].status = status;
  }

  return migrations;
}

export async function saveMigrations(ctx, migrations) {
  const names = migrations.map(m => m.constructor.path);
  const hashes = migrations.map(m => m.constructor.hash);

  await ctx.sql`
  INSERT INTO public.migrations (name, hash)
    SELECT name, hash
    FROM unnest(${names}::text[], ${hashes}::bytea[]) AS files(name, hash)
  ON CONFLICT (name) DO UPDATE SET
    hash = EXCLUDED.hash,
    updated_at = CURRENT_TIMESTAMP`;
}
