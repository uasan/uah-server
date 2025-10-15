import process from 'node:process';
import { isMainThread, parentPort } from 'node:worker_threads';

const controller = new AbortController();
const abort = controller.abort.bind(controller);

export const { signal } = controller;

function handleException(error) {
  console.error(error);
  process.exitCode = 1;
  abort();
}

process
  .once('beforeExit', abort)
  .once('uncaughtException', handleException)
  .once('unhandledRejection', handleException);

if (isMainThread) {
  process
    .once('SIGTSTP', abort)
    .once('SIGQUIT', abort)
    .once('SIGHUP', abort)
    .once('SIGTERM', abort)
    .once('SIGINT', abort)
    .once('SIGUSR1', abort)
    .once('SIGUSR2', abort);
} else {
  parentPort.once('message', abort);

  process.stderr.isTTY = true;
  process.stdout.isTTY = true;
}
