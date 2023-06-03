import { presets } from '#env';
import { STATUS_DELETED } from '../constants.js';
import { createRole } from './roles.js';
import { getFolderPath } from './files.js';
import { setSchemaRole } from './roles.js';
import { createTable, setTableName } from './tables.js';

const grantSchemas = ({ sql }, schemas) => {
  const nameUsers = sql(schemas.map(({ user }) => user).join(', '));
  const nameSchemas = sql(schemas.map(({ name }) => name).join(', '));

  return sql`GRANT USAGE ON SCHEMA ${nameSchemas} TO ${nameUsers}`;
};

const createSchema = async (context, schema) => {
  const { sql } = context;
  const { user, database, schemaName } = schema;

  try {
    await sql`CREATE SCHEMA IF NOT EXISTS ${schemaName} AUTHORIZATION ${user}`;
    await sql`ALTER ROLE ${user} IN DATABASE ${database} SET search_path TO ${schemaName}`;
  } catch (error) {
    if (error?.code === '42704') {
      await createRole(context, schema);
      await createSchema(context, schema);
    } else {
      throw error;
    }
  }
  context.tasks.add(grantSchemas);
};

const setSchemaTableFiles = async ({ sql, config }, schema) => {
  const { tableName, names } = schema;

  for (const { name, hash } of await sql`SELECT name, hash FROM ${tableName}`) {
    names.set(name, {
      name,
      hash,
      schema,
      skip: false,
      wasDone: true,
      status: STATUS_DELETED,
    });
  }

  schema.folders = [];
  schema.isBootStrap = names.size === 0;

  for (const name of Object.keys(config.folders)) {
    schema.folders.push({
      prefix: name + '/',
      params: config.folders[name](schema),
    });
  }
};

const setSchema = async (context, schema) => {
  setTableName(context, schema);

  try {
    await setSchemaTableFiles(context, schema);
  } catch (error) {
    if (error?.code === '42P01') {
      await createSchema(context, schema);
      await createTable(context, schema);
      await setSchemaTableFiles(context, schema);
    } else {
      throw error;
    }
  }
};

const getSchema = (context, name, isCurrent) =>
  setSchemaRole(context, {
    name,
    names: new Map(),
    paths: [getFolderPath(name, isCurrent)],
    isCurrent,
  });

export const getSchemas = context => {
  const appId = presets.app.id;

  if (!appId) throw new Error('Missing current application id');

  const schemas = context.config.apps.map(name =>
    getSchema(context, name, false)
  );

  const schema =
    schemas.find(({ name }) => name === appId) ??
    getSchema(context, appId, true);
  schema.isCurrent = true;

  if (schemas.includes(schema)) schema.paths.push(getFolderPath(appId, true));
  else schemas.push(schema);

  return schemas;
};

export const setSchemas = async (context, { schemas }) => {
  await Promise.all(schemas.map(schema => setSchema(context, schema)));
  await context.resolveTasks(schemas);
};
