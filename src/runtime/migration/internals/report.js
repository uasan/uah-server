import { green, blue, red } from '#utils/console.js';

function report(migration, command, index) {
  console.log(
    green('Migrate: ') +
      index +
      ' ' +
      command +
      ' ' +
      migration.constructor.path
  );
}

export function reportUpMigrate(migration, index) {
  report(migration, green('up'), index);
}

export function reportDownMigrate(migration, index) {
  report(migration, red('down'), index);
}

export function reportStatusMigrate(migration, index) {
  const status = migration.status.toUpperCase();

  console.log(
    index + ' ' + blue(status) + ' ' + green(migration.constructor.path)
  );
}
