import { DIR_LIB, DIR_MIGRATIONS } from '#config';
import { toRelativeURL } from '../../helpers/link.js';
import { host } from '../../host.js';

const format = code => '    ' + code.replaceAll('\n', '\n    ');
export const toPascalCase = text => text[0].toUpperCase() + text.slice(1);

export function createFileMigration(migration) {
  migration.url = DIR_MIGRATIONS + '/' + migration.path + '.js';
  migration.className = toPascalCase(migration.className);

  let source = 'import { Migration } from ';
  source += `'${toRelativeURL(migration.url, DIR_LIB + '/Migration.js')}';`;

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
