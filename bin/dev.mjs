#!/usr/bin/env node --env-file=.env

import { createWatchHost } from '../src/compiler/worker/watch.js';

console.clear();
createWatchHost('./build/bin/server.js');
