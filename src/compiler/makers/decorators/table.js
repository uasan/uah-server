import { setSchema } from '../../entities/migrations/maker.js';
import { createTableMigration } from '../../entities/migrations/table.js';
import { tableModels } from '../../entities/models/table.js';
import { getValueOfLiteral } from '../../helpers/values.js';

export function Table(node, original, decor) {
  const options = decor.arguments[0];
  const model = tableModels.get(original);

  if (options && model) {
    model.table = getValueOfLiteral(options);

    model.tableName = setSchema(model.table.name);
    model.name = model.tableName.replaceAll('"', '');

    createTableMigration(model);
  }

  return node;
}
