import { green, yellow, red } from '../console/colors.js';

export const LOCK_ID = 0;
export const DEFAULT_DATABASE = 'postgres';
export const ERROR_DATABASE_NOT_EXIST = '3D000';

export async function createDatabase(ctx) {
  const { options } = ctx.postgres;

  await ctx.postgres.setOptions({ ...options, database: DEFAULT_DATABASE });
  await ctx.postgres.query(`CREATE DATABASE "${options.database}"`);
  await ctx.postgres.setOptions(options);
}

export async function dropDatabase(ctx) {
  const { options } = ctx.postgres;

  await ctx.postgres.setOptions({ ...options, database: DEFAULT_DATABASE });
  await ctx.postgres.query(`DROP DATABASE IF EXISTS "${options.database}"`);
}

export async function lockMigrate(ctx) {
  const isLock =
    await ctx.sql`SELECT pg_try_advisory_lock(${LOCK_ID}::bigint)`.asValue();

  if (isLock === false) {
    console.log(yellow(`Migrate: `) + red(`waiting release lock ${LOCK_ID}`));

    await ctx.sql`SELECT pg_advisory_lock(${LOCK_ID}::bigint)`;
  }

  console.log(green(`Migrate: start lock ${LOCK_ID}`));
}

export async function unlockMigrate(ctx) {
  await ctx.sql`SELECT pg_advisory_unlock_all()`;
}

export async function connect(context) {
  const ctx = context.prototype;

  try {
    await ctx.postgres.connect();
  } catch (error) {
    if (error.code === ERROR_DATABASE_NOT_EXIST) await createDatabase(ctx);
    else throw error;
  }

  await lockMigrate(ctx);
  return ctx;
}

export async function disconnect(ctx) {
  await ctx.postgres.disconnect();
}
