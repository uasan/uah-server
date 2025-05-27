import { DIR_BIN, DIR_LIB, URL_LIB_RUNTIME } from '../../../config.js';
import { isExportNode } from '../../helpers/checker.js';
import { factoryStaticProperty, updateClass } from '../../helpers/class.js';
import { factoryString } from '../../helpers/expression.js';
import { getNodeTextName } from '../../helpers/var.js';
import { afterEmit, host } from '../../host.js';
import { createFileMigration, getMigrationURL } from './utils.js';

export const migrations = new Map();
export const presetMigrations = new Map();

export const hasMigration = path => migrations.has(getMigrationURL(path));
export const getMigration = path => migrations.get(getMigrationURL(path));

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
        }),
      );
      afterEmit.add(makeMigrations);
    }

    return name;
  } else {
    return 'public.' + name;
  }
}

export function makeMigrations() {
  const classes = [];
  const imports = new Set();
  const ownMigrations = new Set(migrations.values());

  let index = 0;
  let source = `import { migrate } from '${URL_LIB_RUNTIME}migration/app.js';\n\n`;

  source += `import { Migration } from '../${DIR_LIB}/context/Migration.js';\n`;

  for (const meta of presetMigrations.values()) {
    if (meta.isValid) {
      if (ownMigrations.has(meta)) {
        for (const ownMeta of ownMigrations) {
          if (ownMeta.isValid) {
            imports.add(ownMeta);
            ownMigrations.delete(ownMeta);

            if (meta === ownMeta) {
              break;
            }
          }
        }
      } else {
        imports.add(meta);
      }
    }
  }

  for (const meta of ownMigrations) {
    if (meta.isValid) {
      imports.add(meta);
    }
  }

  for (const meta of imports) {
    const alias = '_' + index++;

    classes.push(alias);
    source += `import { ${meta.className} as ${alias} } from '../${meta.url}';\n`;
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

  if (!migration.isValid || migration.className !== className) {
    migration.isValid = true;
    migration.className = className;
    afterEmit.add(makeMigrations);
  }

  return updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    factoryStaticProperty('path', factoryString(migration.url.slice(11, -3))),
    ...node.members,
  ]);
}
