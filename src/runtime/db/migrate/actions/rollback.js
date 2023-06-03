import { green } from '#utils/console.js';
import { runFiles } from '../internals/actions.js';
import { wrongSchema, wrongAllSchemas } from '../internals/errors.js';
import { STATUS_DONE, STATUS_UPDATED } from '../constants.js';

const filterByStatus = ({ status }) =>
  status === STATUS_DONE || status === STATUS_UPDATED;

function filterBySchema({ schema }) {
  return schema === this;
}

export const rollback = async (context, payload) => {
  const [schemaName, optionName] = payload.params;

  let files = payload.files.filter(filterByStatus);
  const schema = payload.schemas.find(schema => schema.name === schemaName);
  const dropSchemas = [];

  if (schema) {
    dropSchemas.push(schema);
    files = files.filter(filterBySchema, schema);
  } else if (schemaName !== 'all') {
    wrongSchema(payload.schemas, schemaName);
  } else if (optionName !== 'schemas') {
    wrongAllSchemas();
  } else {
    dropSchemas.push(...payload.schemas);
  }

  if (files.length) {
    payload.command = 'down';
    payload.files = files.reverse();
    await context.transaction(runFiles, payload);
  }

  const { sql } = context;
  for (const { user, schemaName, tableName } of dropSchemas) {
    await sql`DROP TABLE ${tableName}`.catch();
    await sql`DROP SCHEMA ${schemaName}`.catch();
    await sql`DROP USER ${user}`.catch();
  }

  console.log(green('Migrate: already done'));
};
