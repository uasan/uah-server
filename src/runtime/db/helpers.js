import { readFile } from 'fs/promises';

const trimQuery = query => query.trim();
const filterQuery = command => query =>
  !!query && (!command || query.startsWith(`${command} `));

export const execBatchSQL = async ({ db }, data, command) => {
  const queries = [];
  const blocks = data.split('$$');

  for (let i = 0; i < blocks.length; i++) {
    if (i % 2) {
      const blockNext = blocks[i + 1];
      const index = blockNext.indexOf(';');

      if (command) {
        blocks[i + 1] = blockNext.slice(index + 1);
      } else {
        const block = blocks[i].trim();
        const lastIndex = queries.length - 1;
        const queryEnd = blockNext.slice(0, index).trim();

        blocks[i + 1] = blockNext.slice(index + 1);
        queries[lastIndex] += ` $$\n${block}\n$$ ${queryEnd}`;
      }
    } else {
      queries.push(
        ...blocks[i].split(';').map(trimQuery).filter(filterQuery(command))
      );
    }
  }

  for (const query of queries) {
    await db.unsafe(query);
  }
};

export const execFileSQL = async (context, path, command) => {
  await execBatchSQL(context, await readFile(path, 'utf8'), command);
};
