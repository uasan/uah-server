import { rmSync, existsSync } from 'node:fs';
import { Worker } from 'node:worker_threads';

import { writeFile } from '../../worker/system.js';
import { PATH_BUILD } from '../../../config.js';

export const developmentAPI = {
  worker: null,

  open() {
    if (existsSync(PATH_BUILD)) {
      rmSync(PATH_BUILD, { recursive: true });
    }
  },

  beforeEmit() {
    this.worker?.postMessage('exit');
  },

  saveFile(path, data) {
    writeFile(path, data);
  },

  deleteFile(path) {
    if (existsSync(path)) {
      rmSync(path);
    }
  },

  afterEmit() {
    this.worker?.terminate();
    this.worker = new Worker('./build/bin/start.js').on('error', console.error);
  },
};
