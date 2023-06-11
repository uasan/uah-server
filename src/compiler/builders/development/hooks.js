import { rmSync, existsSync } from 'node:fs';
import { Worker } from 'node:worker_threads';

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
    this.worker?.postMessage('');
  },

  saveFile(url, data) {
    writeFile(toBuildPath(url), data);
  },

  deleteFile(url) {
    if (existsSync(toBuildPath(url))) {
      rmSync(toBuildPath(toBuildPath(url)));
    }
  },

  afterEmit() {
    this.worker?.terminate();
    this.worker = new Worker('./build/bin/start.js').on('error', console.error);
  },

  reset() {},
};
