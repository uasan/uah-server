import { argv } from 'node:process';

import { setMigrations } from './internals/state.js';
import { connect, disconnect } from './internals/connect.js';

import { up } from './actions/up.js';
import { help } from './actions/help.js';
import { status } from './actions/status.js';

const actions = {
  up,
  status,
};

export async function migrate(context, migrations) {
  const action = actions[argv[2] ?? 'up'];

  if (action) {
    const ctx = await connect(context);

    try {
      await action(ctx, await setMigrations(ctx, migrations), ...argv.slice(3));
    } finally {
      await disconnect(ctx);
    }
  } else {
    help();
  }
}
