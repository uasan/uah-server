import { migrate } from '#db/migrate/run.js';
import { loadServices } from '#server/services.js';
import { TREE } from './internals/tree.js';
import { loadTests } from './internals/loader.js';
import { runTests } from './internals/actions.js';
import { createContext } from './internals/context.js';
import {
  printTestTree,
  reportEndTests,
  reportStartTests,
  reportErrorEndTests,
} from './internals/report.js';

export const printAllTestTree = async () => {
  await loadTests();
  printTestTree(TREE);
  console.log('');
};

export const runAllTestFiles = async () => {
  const context = await createContext({
    isRunAllTests: true,
  });

  try {
    await loadTests();

    if (context.isMigrate) {
      await migrate();
    }

    reportStartTests();

    await loadServices(context);
    await context.transaction(runTests, TREE).catch(reportErrorEndTests);
  } finally {
    await context.db.end();
    await migrate.context.dropDatabase();
  }

  reportEndTests();
};
