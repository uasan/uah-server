#!/usr/bin/env node

import { createWatchHost } from '../src/compiler/worker/watch.js';

console.clear();
createWatchHost('./build/bin/server.js');
