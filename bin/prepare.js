import { copyFileSync } from 'fs';
import { resolve as resolvePath } from 'path';

import { presets } from '#env';
import { CWD, resolve } from '#utils/location.js';

if (!presets.app.isProduction) {
  const source = resolve(import.meta, '../src/utils/pre-push');
  const target = resolvePath(CWD, '.git/hooks/pre-push');

  copyFileSync(source, target);
}
