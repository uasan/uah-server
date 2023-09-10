import process from 'node:process';
import { Worker } from 'node:worker_threads';
import { rmSync, existsSync } from 'node:fs';

import { writeFile } from './system.js';
import { PATH_BUILD } from '../../config.js';
import { toBuildPath } from '../helpers/link.js';

export class BuilderHooks {
  worker = {
    filename: '',
    instance: null,
    options: { argv: process.argv.slice(2) },
    close: () => {
      if (this.worker.instance) {
        this.worker.instance.once('exit', process.exit.bind(process));
        this.worker.instance.postMessage(0);
      } else {
        process.exit(0);
      }
    },
  };

  constructor(filename) {
    if (filename) {
      this.worker.filename = filename;

      process
        .once('SIGTSTP', this.worker.close)
        .once('SIGQUIT', this.worker.close)
        .once('SIGHUP', this.worker.close)
        .once('SIGTERM', this.worker.close)
        .once('SIGINT', this.worker.close)
        .once('SIGUSR1', this.worker.close)
        .once('SIGUSR2', this.worker.close)
        .once('disconnect', this.worker.close)
        .once('beforeExit', this.worker.close);
    }
  }

  open() {
    if (existsSync(PATH_BUILD)) {
      rmSync(PATH_BUILD, { recursive: true });
    }
  }

  beforeEmit() {
    this.worker.instance?.postMessage(0);
  }

  saveFile(url, data) {
    writeFile(toBuildPath(url), data);
  }

  deleteFile(url) {
    if (existsSync(toBuildPath(url))) {
      rmSync(toBuildPath(url));
    }
  }

  afterEmit() {
    if (this.worker.filename) {
      this.worker.instance?.terminate();
      this.worker.instance = new Worker(
        this.worker.filename,
        this.worker.options
      ).on('error', console.error);
    }
  }

  reset() {}
}
