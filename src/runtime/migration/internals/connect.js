import { style } from '#utils/console.js';
import { ERRORS } from '@uah/postgres/src/constants.js';
import { LOCK_ID } from '../constants.js';

export const DEFAULT_DATABASE = 'postgres';

export async function createDatabase(ctx) {
  const { options } = ctx.postgres;

  await ctx.postgres.reset({ ...options, database: DEFAULT_DATABASE });
  await ctx.postgres.query(`CREATE DATABASE "${options.database}"`);
  await ctx.postgres.reset(options);
}

export async function dropDatabase(ctx) {
  const { options } = ctx.postgres;

  await ctx.postgres.reset({ ...options, database: DEFAULT_DATABASE });
  await ctx.postgres.query(`DROP DATABASE IF EXISTS "${options.database}"`);
}

export async function lockMigrate(ctx) {
  const isLock =
    await ctx.sql`SELECT pg_try_advisory_lock(${LOCK_ID}::bigint)`.asValue();

  if (isLock === false) {
    console.log(
      style.yellow(`Migrate: `) + style.red(`waiting release lock ${LOCK_ID}`),
    );

    await ctx.sql`SELECT pg_advisory_lock(${LOCK_ID}::bigint)`;
  }
}

export async function unlockMigrate(ctx) {
  await ctx.sql`SELECT pg_advisory_unlock_all()`;
}

export async function connect(context) {
  const ctx = context.prototype;

  try {
    await ctx.postgres.connect();
  } catch (error) {
    if (error.code === ERRORS.DATABASE_NOT_EXIST) await createDatabase(ctx);
    else throw error;
  }

  return ctx;
}

export async function disconnect(ctx) {
  await ctx.postgres.disconnect();
}
