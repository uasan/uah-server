import { DIR_LIB, DIR_MIGRATIONS } from '#config';
import { getValueOfLiteral } from '../../helpers/expression.js';
import { toRelativeURL } from '../../helpers/link.js';
import { host } from '../../host.js';

const format = code => '    ' + code.replaceAll('\n', '\n    ');
export const toPascalCase = text => text[0].toUpperCase() + text.slice(1);

export function getSQLValueOfNode(node) {
  let value = getValueOfLiteral(node);

  if (typeof value === 'string') {
    value = '\'' + value.replaceAll('\'', '\'\'') + '\'';
  }

  return value;
}

export const getMigrationURL = path => DIR_MIGRATIONS + '/' + path + '.js';

export function createFileMigration(migration) {
  migration.isValid = true;
  migration.url = getMigrationURL(migration.path);
  migration.className = toPascalCase(migration.className);

  let source = 'import { Migration } from ';
  source += `'${toRelativeURL(migration.url, DIR_LIB + '/context/Migration.js')}';`;

  source += '\n\n';
  source += `export class ${migration.className} extends Migration {\n`;
  source += `  static path = '${migration.path}';\n`;

  source += '\n  async up() {\n';
  source += format(migration.members.up);
  source += '\n  }\n';

  if (migration.members.onDone) {
    source += '\n  async onDone() {\n';
    source += format(migration.members.onDone);
    source += '\n  }\n';
  }

  if (migration.members.onWasDone) {
    source += '\n  async onWasDone() {\n';
    source += format(migration.members.onWasDone);
    source += '\n  }\n';
  }

  if (migration.members.down) {
    source += '\n  async down() {\n';
    source += format(migration.members.down);
    source += '\n  }\n';
  }

  source += '}\n';

  host.hooks.saveFile(migration.url, source);

  return migration;
}
