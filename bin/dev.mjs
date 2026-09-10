#!/usr/bin/env node

import { argv } from 'node:process';
import { runWatchHost } from '../src/compiler/worker/program.js';

console.clear();
runWatchHost(argv[2] ?? 'build/bin/server.js');
