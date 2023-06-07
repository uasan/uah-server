import { isMainThread, parentPort } from 'node:worker_threads';

const controller = new globalThis.AbortController();

export const { signal } = controller;

export function abort() {
  controller.abort();
}

function handleException(error) {
  console.error(error);
  process.exitCode = 1;
  abort();
}

process.once('uncaughtException', handleException);
process.once('unhandledRejection', handleException);

if (isMainThread) {
  process.once('disconnect', abort).once('beforeExit', abort);

  for (const name of [
    'SIGTSTP',
    'SIGQUIT',
    'SIGHUP',
    'SIGTERM',
    'SIGINT',
    'SIGUSR1',
    'SIGUSR2',
  ]) {
    process.once(name, abort);
  }
} else {
  parentPort.on('message', message => {
    switch (message) {
      case 'exit':
        abort();
    }
  });
}
