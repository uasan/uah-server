import { Pool } from '@uah/postgres/src/pool.js';
import { Client } from '@uah/postgres/src/client.js';
import { signal } from '../process.js';

export function initPostgres({ prototype }, options) {
  prototype.postgres =
    options.maxConnections > 1
      ? new Pool({ signal, ...options })
      : new Client({ signal, ...options });
}
