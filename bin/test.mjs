#!/usr/bin/env node --env-file=.env

import { createBuilderHost } from '../src/compiler/worker/watch.js';

console.clear();
createBuilderHost('./build/bin/test.js');
