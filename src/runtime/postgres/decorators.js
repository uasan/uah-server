import { PostgresClient } from '@uah/postgres/src/client.js';
import { PostgresPool } from '@uah/postgres/src/pool.js';

import { signal } from '../process.js';

export function Postgres({ prototype }, options) {
  prototype.postgres = options.maxConnections > 1
    ? new PostgresPool({ signal, ...options })
    : new PostgresClient({ signal, ...options });
}

export function Table(ctor, options) {
  return options;
}
