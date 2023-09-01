#!/usr/bin/env node --watch --experimental-import-meta-resolve

import { createWatchHost } from '../src/compiler/worker/watch.js';

console.clear();
createWatchHost('./build/bin/server.js');
