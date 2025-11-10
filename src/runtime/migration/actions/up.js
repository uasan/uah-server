import { STATUS_DONE, STATUS_NEW, STATUS_UPDATED } from '../constants.js';
import { lockMigrate, unlockMigrate } from '../internals/connect.js';
import { reportUpMigrate } from '../internals/report.js';
import { saveMigrations } from '../internals/state.js';

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
  const onDoneMigrations = [];
  const onWasDoneMigrations = [];

  for (const migration of migrations) {
    switch (migration.status) {
      case STATUS_NEW:
      case STATUS_UPDATED: {
        upMigrations.push(migration);

        if (Object.hasOwn(migration, 'onDone')) {
          onDoneMigrations.push(migration);
        }

        break;
      }

      case STATUS_DONE: {
        if (Object.hasOwn(migration, 'onWasDone')) {
          onWasDoneMigrations.push(migration);
        }

        break;
      }
    }
  }

  if (upMigrations.length) {
    await ctx.startTransaction(upMigration, upMigrations);

    for (const migration of onDoneMigrations) {
      await migration.onDone();
    }
  }

  for (const migration of onWasDoneMigrations) {
    await migration.onWasDone();
  }
}
