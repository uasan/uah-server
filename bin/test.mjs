#!/usr/bin/env node

import { runBuilderHost } from '../src/compiler/worker/program.js';

console.clear();
await runBuilderHost('bin/test.js');
