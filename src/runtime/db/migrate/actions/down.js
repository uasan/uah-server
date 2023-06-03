import { green } from '#utils/console.js';
import { runFiles } from '../internals/actions.js';

export const down = async (context, payload) => {
  const { schemas, params } = payload;
  const [schemaName, fileName] = params;

  const schema = schemas.find(schema => schema.name === schemaName);

  if (!schema) {
    throw new Error(`Not found schema "${schemaName}"`);
  }

  const file = schema.names.get(fileName);

  if (!file) {
    throw new Error(`Not found file "${fileName}"`);
  }

  if (file) {
    payload.files = [file];
    await context.transaction(runFiles, payload);
  }

  console.log(green('Migrate: already done'));
};
