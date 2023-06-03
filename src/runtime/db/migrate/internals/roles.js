import { sql } from '#db/sql/sql.js';
import { quoteLiteral } from '#db/utils/text.js';

export const setSchemaRole = (context, schema) => {
  const { env } = process;
  const { name } = schema;
  const NAME = name.toUpperCase();

  schema.user = sql(`"${env[`${NAME}_DB_USER`] ?? `api_${name}`}"`);
  schema.password = env[`${NAME}_DB_PASS`] ?? 'pass';
  schema.database = sql(`"${context.config.connection.database}"`);
  schema.schemaName = sql(`${schema.name}`);

  schema.payload = {
    user: schema.user,
    database: schema.database,
    schema: schema.schemaName,
    wasDone: name => schema.names.get(name)?.wasDone === true,
  };

  return schema;
};

export const createRole = async ({ sql }, { user, password }) => {
  await sql`CREATE ROLE ${user} WITH NOCREATEDB NOCREATEROLE
    LOGIN PASSWORD ${sql(quoteLiteral(password))}`;

  await sql`GRANT ${user} TO CURRENT_USER`;
};
