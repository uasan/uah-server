#!/usr/bin/env -S node --env-file=.env

import { runBuilderHost } from '../src/compiler/worker/program.js';

runBuilderHost();
