#!/usr/bin/env node --env-file=.env

import { runBuilderHost } from '../src/compiler/worker/program.js';

runBuilderHost();
