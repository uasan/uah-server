import process from 'node:process';
import { Worker } from 'node:worker_threads';
import { rmSync, existsSync } from 'node:fs';

import { writeFile } from '../../worker/system.js';
import { PATH_BUILD } from '../../../config.js';
import { toBuildPath } from '../../helpers/link.js';

export const developmentAPI = {
  worker: null,

  open() {
    if (existsSync(PATH_BUILD)) {
      rmSync(PATH_BUILD, { recursive: true });
    }
  },

  beforeEmit() {
    this.worker?.postMessage(0);
  },

  saveFile(url, data) {
    writeFile(toBuildPath(url), data);
  },

  deleteFile(url) {
    if (existsSync(toBuildPath(url))) {
      rmSync(toBuildPath(url));
    }
  },

  afterEmit() {
    this.worker?.terminate();
    this.worker = new Worker('./build/bin/start.js').on('error', console.error);
  },

  reset() {},
};

function closeWorker() {
  const { worker } = developmentAPI;

  if (worker) {
    worker.on('exit', process.exit.bind(process)).postMessage(0);
  } else {
    process.exit(0);
  }
}

process
  .once('SIGTSTP', closeWorker)
  .once('SIGQUIT', closeWorker)
  .once('SIGHUP', closeWorker)
  .once('SIGTERM', closeWorker)
  .once('SIGINT', closeWorker)
  .once('SIGUSR1', closeWorker)
  .once('SIGUSR2', closeWorker)
  .once('disconnect', closeWorker)
  .once('beforeExit', closeWorker);
