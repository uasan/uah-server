import { lockMigrate, unlockMigrate } from '../internals/connect.js';
import { reportUpMigrate } from '../internals/report.js';
import { saveMigrations } from '../internals/state.js';
import { STATUS_DONE, STATUS_NEW, STATUS_UPDATED } from '../constants.js';

async function upMigration(ctx, migrations) {
  await lockMigrate(ctx);

  for (let index = 0; index < migrations.length; ) {
    const migration = migrations[index];

    reportUpMigrate(migration, ++index);
    await migration.up();
  }

  await saveMigrations(ctx, migrations);
  await unlockMigrate(ctx);
}

export async function up(ctx, migrations) {
  const upMigrations = [];
  const wasDoneMigrations = [];
  const afterCommitMigrations = [];

  for (const migration of migrations)
    switch (migration.status) {
      case STATUS_NEW:
      case STATUS_UPDATED: {
        upMigrations.push(migration);

        if (Object.hasOwn(migration, 'onAfterCommit'))
          afterCommitMigrations.push(migration);

        break;
      }

      case STATUS_DONE: {
        if (Object.hasOwn(migration, 'onWasDone'))
          wasDoneMigrations.push(migration);

        break;
      }
    }

  if (upMigrations.length) {
    await ctx.startTransaction(upMigration, upMigrations);
  }

  for (const migration of afterCommitMigrations) {
    await migration.onAfterCommit();
  }

  for (const migration of wasDoneMigrations) {
    await migration.onWasDone();
  }
}
