#!/usr/bin/env node --env-file=.env

import { runWatchHost } from '../src/compiler/worker/program.js';

console.clear();
runWatchHost('./build/bin/server.js');
