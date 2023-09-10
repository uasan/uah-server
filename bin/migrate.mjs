#!/usr/bin/env node

import { createBuilderHost } from '../src/compiler/worker/watch.js';

console.clear();
createBuilderHost('./build/bin/migrate.js');
