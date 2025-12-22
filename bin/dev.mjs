#!/usr/bin/env node

import { runWatchHost } from '../src/compiler/worker/program.js';

console.clear();
runWatchHost('./build/bin/server.js');
