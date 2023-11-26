import { afterEmit } from '../../host.js';
import { createFileMigration, getSQLValueOfNode } from './utils.js';
import { makeMigrations, presetMigrations as presets } from './maker.js';

export function createTableMigration(model) {
  let { url, name, table } = model;
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
      field += ' DEFAULT ' + getSQLValueOfNode(column.default);
    }

    if (column.references) {
      field += ' ' + column.references;
    }

    fields.push(field);
  }

  if (table.primary?.length) {
    fields.push('\n  PRIMARY KEY ("' + table.primary.join('", "') + '")');
  }

  up += fields.join(',\n');
  up += '\n)`);';

  if (model.comment) {
    up += '\nawait this.postgres.query("';
    up += `COMMENT ON TABLE ${model.tableName} IS '`;
    up += model.comment.replaceAll("'", "''");
    up += '\'");';
  }

  if (!presets.has(url) || presets.get(url).className !== className) {
    afterEmit.add(makeMigrations);
  }

  presets.set(
    url,
    createFileMigration({ path, className, members: { up, down } })
  );
}
