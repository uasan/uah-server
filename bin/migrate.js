import { presets } from '#env';
import { migrate } from '#db/migrate/run.js';

await migrate({
  ...presets.migrate,
  command: process.argv[2] ?? 'up',
  options: process.argv.slice(3),
});
