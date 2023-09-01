import { LOCK_ID } from '../constants.js';
import { presets } from '#env';
import { green, yellow, red } from '#utils/console.js';
import { setDataBaseContext } from '#db/context.js';
import { getConnectOptions, createClient } from '#db/client.js';

export const defaultOptions = {
  max: 1,
  prepare: false,
  username: 'postgres',
  password: 'pass',
};

const createDatabase = async context => {
  const { connection } = context.config;
  await context.db.end({ timeout: 0 });

  const client = createClient({ ...connection, database: 'postgres' });
  await client.unsafe(`CREATE DATABASE "${connection.database}"`);
  await client.end({ timeout: 0 });

  context.db = createClient(connection);
};

export const dropDatabase = async context => {
  const { connection } = context.config;
  await context.db.end({ timeout: 0 });

  const client = createClient({ ...connection, database: 'postgres' });
  await client.unsafe(`DROP DATABASE IF EXISTS "${connection.database}"`);
  await client.end({ timeout: 0 });
};

export const lockMigrate = async ({ sql }) => {
  const isLock = await sql`
    SELECT pg_try_advisory_lock(${LOCK_ID}::bigint) AS "0"
  `.findOneValue();

  if (isLock === false) {
    console.log(yellow(`Migrate: `) + red(`waiting release lock ${LOCK_ID}`));
    await sql`SELECT pg_advisory_lock(${LOCK_ID}::bigint)`;
  }

  if (!presets.app.isTesting)
    console.log(green(`Migrate: start lock ${LOCK_ID}`));
};

export const unlockMigrate = async ({ sql }) =>
  await sql`SELECT pg_advisory_unlock_all()`;

export const connect = async context => {
  context.config.connection = getConnectOptions(
    {
      ...presets.db,
      ...defaultOptions,
      ...context.config.connection,
    },
    'MASTER'
  );

  setDataBaseContext(context, context.config.connection);

  try {
    await lockMigrate(context);
  } catch (error) {
    if (error?.code === '3D000') {
      await createDatabase(context);
      await lockMigrate(context);
    } else {
      throw error;
    }
  }
};

export const disconnect = async context => {
  if (context.db) {
    await context.db.end({ timeout: 0 });
  }
};
