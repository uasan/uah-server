import { green, red, bold } from '#utils/console.js';
import { getSchemas, setSchemas } from './schemas.js';
import { saveTable } from './tables.js';
import { setFiles, files } from './files.js';
import { dropDatabase } from './database.js';
import { presets } from '#env';

export const createContext = config => {
  const context = {
    config,
    tasks: new Set(),
    async resolveTasks(payload) {
      for (const task of this.tasks) await task(this, payload);
      this.tasks.clear();
    },
    dropDatabase() {
      return dropDatabase(this);
    },
    language: presets.language,
    languages: presets.languages,
    defaultLanguage: presets.language,
  };
  return context;
};

export const createPayload = async context => {
  const payload = {
    command: context.config.command,
    params: context.config.options,
    files,
    schemas: getSchemas(context),
  };
  await setSchemas(context, payload);
  await setFiles(payload);
  return payload;
};

export const runFiles = async (context, payload) => {
  let i = 0;
  const { files, command } = payload;
  const action = command === 'up' ? green(command) : bold(red(command));

  for (const { name, skip, schema, [command]: method } of files)
    if (skip === false) {
      console.log(
        green('Migrate') + `: ${++i} ${action} ${schema.name} ${name}`
      );

      await method?.(context, schema.payload);
    }

  await saveTable(context, payload);
};
