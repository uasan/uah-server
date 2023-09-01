import { host } from '../../host.js';
import { isExportNode } from '../../helpers/checker.js';
import { factoryStaticProperty, updateClass } from '../../helpers/class.js';
import { factoryString } from '../../helpers/expression.js';
import { getNodeTextName } from '../../helpers/var.js';
import { DIR_BIN, DIR_LIB, URL_LIB_RUNTIME } from '../../../config.js';

export const migrations = new Set();

export function makeMigrations() {
  let index = 0;
  let classes = [];
  let source = `import { migrate } from '${URL_LIB_RUNTIME}migration/app.js';\n\n`;

  source += `import { Migration as _0 } from '../${DIR_LIB}/Migration.js';\n`;

  for (const { className, url } of migrations)
    if (className) {
      const alias = '_' + ++index;

      classes.push(alias);
      source += `import { ${className} as ${alias} } from '../${url}';\n`;
    }

  source += `\nawait migrate(_0, [${classes.join(', ')}]);\n`;

  host.hooks.saveFile(DIR_BIN + '/migrate.js', source);
}

export function MigrationContext(node) {
  const { migration } = host.entity;

  if (!migration || !isExportNode(node)) {
    return host.visitEachChild(node);
  }

  node = host.visitEachChild(node);

  migration.className = getNodeTextName(node);

  return updateClass(node, node.modifiers, node.name, node.heritageClauses, [
    factoryStaticProperty('path', factoryString(migration.url.slice(11, -3))),
    ...node.members,
  ]);
}
