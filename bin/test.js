import { runAllTestFiles, printAllTestTree } from '#test/run.js';

process.argv[2] === 'status'
  ? await printAllTestTree()
  : await runAllTestFiles();
