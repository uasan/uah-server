#!/usr/bin/env node --experimental-import-meta-resolve

import { createBuilderHost } from '../src/compiler/worker/watch.js';

console.clear();
createBuilderHost('./build/bin/migrate.js');
