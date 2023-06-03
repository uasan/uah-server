import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { presets } from '#env';
import { files, indexes, getHash, setStatusByHash } from './internals/files.js';
import { copyFromFile, upsertFromFile } from '../utils/csv.js';
import { sql } from '../sql/sql.js';
export { sql };

export const use = ({ url }) => {
  const file = files.find(file => file.url === url);

  if (indexes.has(url)) {
    throw new Error('Re-call use');
  }

  if (!file) {
    throw new Error(`Not found file ${url}`);
  }

  indexes.set(url, (file.index = indexes.size));

  return {
    up: up => {
      file.up = up;
    },
    down: down => {
      file.down = down;
    },
    version: data => {
      setStatusByHash(
        file,
        data == null ? null : getHash(JSON.stringify(data))
      );
    },
    csv: {
      copyFromFile: (context, table, path) =>
        copyFromFile(
          context,
          table,
          resolve(fileURLToPath(url.slice(0, url.lastIndexOf('/'))), path)
        ).then(() =>
          context.tasks.add(() => context.sql`VACUUM ANALYZE ${table}`)
        ),
      upsertFromFile: (context, table, path, keys) =>
        upsertFromFile(
          context,
          table,
          resolve(fileURLToPath(url.slice(0, url.lastIndexOf('/'))), path),
          keys
        ).then(() =>
          context.tasks.add(() => context.sql`VACUUM ANALYZE ${table}`)
        ),
    },
    isTesting: presets.app.isTesting,
    isProduction: presets.app.isProduction,
  };
};

export const schema = ([name]) => sql(`${presets.app.id}.${name}`);
