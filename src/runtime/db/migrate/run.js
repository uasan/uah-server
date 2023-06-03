import { presets } from '#env';
import { up } from './actions/up.js';
import { down } from './actions/down.js';
import { help } from './actions/help.js';
import { status } from './actions/status.js';
import { rollback } from './actions/rollback.js';
import { connect, disconnect } from './internals/database.js';
import { createContext, createPayload } from './internals/actions.js';

const actions = {
  up,
  down,
  help,
  status,
  rollback,
  __proto__: null,
};

export const migrate = async (config = { ...presets.migrate }) => {
  const context = (migrate.context = createContext(config));
  const action = actions[config.command] ?? actions.help;

  if (action === actions.help) action();
  else
    try {
      await connect(context);
      await action(context, await createPayload(context));
      await context.resolveTasks();
    } finally {
      await disconnect(context).catch(console.error);
    }
};
