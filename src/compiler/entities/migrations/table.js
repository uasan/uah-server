import { afterEmit } from '../../host.js';
import { createFileMigration, getSQLValueOfNode } from './utils.js';
import { makeMigrations, presetMigrations as presets } from './maker.js';

export function createTableMigration(model) {
  let { url, name } = model;
  let fields = [];

  let path = 'tables/' + name;
  let className = name.slice(name.indexOf('.') + 1) + 'Table';

  let up = `await this.postgres.query(\`CREATE TABLE ${model.tableName} (\n`;
  let down = `await this.postgres.query('DROP TABLE ${model.tableName}');`;

  for (const column of model.columns.values()) {
    let field = '  "' + column.name + '" ' + column.type;

    if (column.isNotNull) {
      field += ' NOT NULL';
    }

    if (column.default) {
      field += ' default ' + getSQLValueOfNode(column.default);
    }

    fields.push(field);
  }

  up += fields.join(',\n');
  up += '\n)`);';

  if (!presets.has(url) || presets.get(url).className !== className) {
    afterEmit.add(makeMigrations);
  }

  presets.set(
    url,
    createFileMigration({ path, className, members: { up, down } })
  );
}
