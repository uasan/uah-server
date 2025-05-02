import { afterEmit } from '../../host.js';
import { makeMigrations, presetMigrations as presets } from './maker.js';
import { createFileMigration, getSQLValueOfNode } from './utils.js';

export function createTableMigration(model) {
  let fields = [];
  let { url, name, path, table } = model;

  let className = name.slice(name.indexOf('.') + 1) + 'Table';

  let up = `await this.postgres.query(\`CREATE TABLE ${model.tableName} (\n`;
  let down = `await this.postgres.query('DROP TABLE ${model.tableName}');`;

  for (const column of model.columns.values()) {
    let field = '  "' + column.name + '" ' + column.type;

    if (column.isNotNull) {
      field += ' NOT NULL';
    }

    if (column.default) {
      const value = getSQLValueOfNode(column.default);

      if (value != null) {
        field += ' DEFAULT ' + value;
      } else if (column.type === 'timestamptz') {
        field += ' DEFAULT CURRENT_TIMESTAMP';
      }
    }

    if (column.references) {
      field += ' ' + column.references;
    }

    fields.push(field);
  }

  if (table.primary?.length) {
    fields.push('\n  PRIMARY KEY ("' + table.primary.join('", "') + '")');
  }

  if (table.unique) {
    for (const key of Object.keys(table.unique)) {
      const columns = table.unique[key];

      if (Array.isArray(columns)) {
        fields.push(
          '  CONSTRAINT "' + key + '" UNIQUE ("' + columns.join('", "') + '")',
        );
      }
    }
  }

  up += fields.join(',\n');
  up += '\n)`);';

  if (model.comment) {
    up += '\nawait this.postgres.query("';
    up += `COMMENT ON TABLE ${model.tableName} IS '`;
    up += model.comment.replaceAll('\'', '\'\'');
    up += '\'");';
  }

  if (!presets.has(url) || presets.get(url).className !== className) {
    afterEmit.add(makeMigrations);
  }

  presets.set(
    url,
    createFileMigration({ path, className, members: { up, down } }),
  );
}
