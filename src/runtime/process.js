import process from 'node:process';
import { isMainThread, parentPort } from 'node:worker_threads';

const controller = new AbortController();
export const { signal } = controller;

function shutdown() {
  controller.abort();

  if (parentPort) {
    parentPort.close();
  }
}

function handleException(error) {
  process.exitCode = 1;
  console.error(error);
  shutdown();
}

process
  .once('beforeExit', shutdown)
  .once('uncaughtException', handleException)
  .once('unhandledRejection', handleException);

if (isMainThread) {
  process
    .once('SIGTSTP', shutdown)
    .once('SIGQUIT', shutdown)
    .once('SIGHUP', shutdown)
    .once('SIGTERM', shutdown)
    .once('SIGINT', shutdown)
    .once('SIGUSR1', shutdown)
    .once('SIGUSR2', shutdown);
} else {
  parentPort.once('message', shutdown);
  process.stderr.isTTY = true;
  process.stdout.isTTY = true;
}
