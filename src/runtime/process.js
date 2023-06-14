import { isMainThread, parentPort } from 'node:worker_threads';

const controller = new AbortController();
export const { signal } = controller;

function abort() {
  controller.abort();
}

function handleException(error) {
  console.error(error);
  process.exitCode = 1;
  abort();
}

process
  .once('disconnect', abort)
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
}
