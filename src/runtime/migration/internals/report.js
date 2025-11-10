import { style } from '#utils/console.js';

function report(migration, command, index) {
  console.log(
    style.green('Migrate: ') +
      index +
      ' ' +
      command +
      ' ' +
      migration.constructor.path,
  );
}

export function reportUpMigrate(migration, index) {
  report(migration, style.green('up'), index);
}

export function reportDownMigrate(migration, index) {
  report(migration, style.red('down'), index);
}

export function reportStatusMigrate(migration, index) {
  const status = migration.status.toUpperCase();

  console.log(
    index +
      ' ' +
      style.blue(status) +
      ' ' +
      style.green(migration.constructor.path),
  );
}
