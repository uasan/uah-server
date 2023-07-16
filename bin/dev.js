import { CWD } from '../src/config.js';
import { createWatchHost } from '../src/compiler/worker/watch.js';
import { developmentAPI } from '../src/compiler/builders/development/hooks.js';

console.clear();
createWatchHost(CWD, developmentAPI);
