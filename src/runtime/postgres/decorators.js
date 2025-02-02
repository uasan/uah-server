import { PostgresPool } from '@uah/postgres/src/pool.js';
import { PostgresClient } from '@uah/postgres/src/client.js';

import { sql } from './sql.js';
import { signal } from '../process.js';
import { startTransaction } from './transaction.js';

export function Postgres({ prototype }, options) {
  prototype.sql = sql;
  prototype.startTransaction = startTransaction;

  prototype.postgres =
    options.maxConnections > 1
      ? new PostgresPool({ signal, ...options })
      : new PostgresClient({ signal, ...options });
}

export function Table() {
  //ctor.table = options;
}
