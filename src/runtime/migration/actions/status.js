import { reportStatusMigrate } from '../internals/report.js';

export function status(ctx, migrations) {
  for (let index = 0; index < migrations.length; ) {
    const migration = migrations[index];

    reportStatusMigrate(migration, ++index);
  }
}
