import { migrate } from '#db/migrate/run.js';
import { loadServices } from '#server/services.js';
import { TREE } from './internals/tree.js';
import { loadTest } from './internals/loader.js';
import { runTests } from './internals/actions.js';
import { createContext } from './internals/context.js';
import { reportErrorEndTests } from './internals/report.js';
import { confirmCommit } from './internals/process.js';

export const runOneTestFile = async (path, name) => {
  const context = await createContext({
    isSafePoint: false,
    isRunAllTests: false,
  });
  // && process.pid - process.ppid === 1
  await loadTest(path, name);
  if (context.isMigrate) {
    await migrate();
  }

  await loadServices(context);
  await context
    .transaction(() => runTests(context, TREE).then(confirmCommit))
    .catch(reportErrorEndTests);
};
