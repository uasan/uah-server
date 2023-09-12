import { afterEmit, host } from '../../host.js';
import { isExportNode } from '../../helpers/checker.js';
import { factoryStaticProperty, updateClass } from '../../helpers/class.js';
import { factoryString } from '../../helpers/expression.js';
import { getNodeTextName } from '../../helpers/var.js';
import { DIR_BIN, DIR_LIB, URL_LIB_RUNTIME } from '../../../config.js';
import { createFileMigration } from './utils.js';

export const migrations = new Set();
export const presetMigrations = new Map();

export function setSchema(name) {
  if (name.includes('.')) {
    const schema = name.slice(0, name.indexOf('.')).replaceAll('"', '');

    if (presetMigrations.has(schema) === false) {
      presetMigrations.set(
        schema,
        createFileMigration({
          path: 'schemas/' + schema,
          className: schema + 'Schema',
          members: {
            up: `await this.postgres.query('CREATE SCHEMA IF NOT EXISTS "${schema}"');`,
            down: `await this.postgres.query('DROP SCHEMA IF EXISTS "${schema}"');`,
          },
        })
      );
      afterEmit.add(makeMigrations);
    }

    return name;
  } else {
    return 'public.' + name;
  }
}

export function makeMigrations() {
  let index = 0;
  let classes = [];
  let source = `import { migrate } from '${URL_LIB_RUNTIME}migration/app.js';\n\n`;

  source += `import { Migration } from '../${DIR_LIB}/Migration.js';\n`;

  for (const { className, url } of [
    ...presetMigrations.values(),
    ...migrations,
  ])
    if (className) {
      const alias = '_' + index++;

      classes.push(alias);
      source += `import { ${className} as ${alias} } from '../${url}';\n`;
    }

  source += `\nawait migrate(Migration, [${classes.join(', ')}]);\n`;

  host.hooks.saveFile(DIR_BIN + '/migrate.js', source);
}

export function MigrationContext(node) {
  const { migration } = host.entity;

  if (!migration || !isExportNode(node)) {
    return host.visitEachChild(node);
  }

  node = host.visitEachChild(node);

  const className = getNodeTextName(node);

  if (!migrations.has(migration) || migration.className !== className) {
    migrations.add(migration);
    afterEmit.add(makeMigrations);
    migration.className = className;
  }

  return updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    factoryStaticProperty('path', factoryString(migration.url.slice(11, -3))),
    ...node.members,
  ]);
}
