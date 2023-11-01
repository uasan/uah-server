import { Pool } from '@uah/postgres/src/pool.js';
import { Client } from '@uah/postgres/src/client.js';

import { sql } from './query/sql.js';
import { signal } from '../process.js';
import { startTransaction } from './transaction.js';

export function Postgres({ prototype }, options) {
  prototype.sql = sql;
  prototype.startTransaction = startTransaction;

  prototype.postgres =
    options.maxConnections > 1
      ? new Pool({ signal, ...options })
      : new Client({ signal, ...options });
}
