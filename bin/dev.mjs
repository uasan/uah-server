#!/usr/bin/env node --env-file=.env --watch

import { createWatchHost } from '../src/compiler/worker/watch.js';

console.clear();
createWatchHost('./build/bin/server.js');
