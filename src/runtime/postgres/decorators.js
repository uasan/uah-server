import { PostgresPool } from '@uah/postgres/src/pool.js';
import { signal } from '../process.js';

export const postgresContexts = new Set();

export function Postgres(context, options) {
  postgresContexts.add(context);

  return (context.prototype.postgres = new PostgresPool({
    signal,
    ...options,
  }));
}

export function Table(ctor, options) {
  return options;
}
