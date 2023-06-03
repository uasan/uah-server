import { reportPass, reportSkipped, reportFail } from './report.js';

export const runTests = async (context, tree) => {
  for (const [test, node] of tree) {
    if (test.skipped) {
      reportSkipped(test, node);
      continue;
    }

    if (context.isSafePoint)
      await context.db.unsafe(`SAVEPOINT "${node.index}"`);

    try {
      test.result = await test.run();

      reportPass(test, node);

      if (node.children.size) {
        await runTests(context, node.children);
      }
    } catch (error) {
      reportFail(test, error);
    }

    if (context.isSafePoint)
      await context.db.unsafe(`ROLLBACK TO SAVEPOINT "${node.index}"`);
  }
};
