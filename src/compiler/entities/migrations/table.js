import { afterEmit } from '../../host.js';
import { createFileMigration } from './utils.js';
import { makeMigrations, presetMigrations as presets } from './maker.js';

export function createTableMigration(model) {
  let { name } = model;
  let members = [];

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

    members.push(column);
  }

  up += members.join(',\n');
  up += '\n)`);';

  let className = name.slice(name.indexOf('.') + 1) + 'Table';

  if (!presets.has(name) || presets.get(model.name).className !== className) {
    afterEmit.add(makeMigrations);
  }

  presets.set(
    name,
    createFileMigration({
      path: 'tables/' + model.name,
      className,
      members: {
        up,
        down,
      },
    })
  );
}
