import { afterEmit } from '../../host.js';
import { createFileMigration } from './utils.js';
import { makeMigrations, presetMigrations as presets } from './maker.js';

export function createTableMigration(model) {
  let { url, name } = model;
  let fields = [];

  let path = 'tables/' + name;
  let className = name.slice(name.indexOf('.') + 1) + 'Table';

  let up = `await this.postgres.query(\`CREATE TABLE ${model.tableName} (\n`;
  let down = `await this.postgres.query('DROP TABLE ${model.tableName}');`;

  for (const { name, type, ...meta } of model.columns.values()) {
    let column = '  "' + name + '" ' + type;

    if (meta.isNotNull) {
      column += ' NOT NULL';
    }

    if (meta.default) {
      column += ' default ' + meta.default;
    }

    fields.push(column);
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
