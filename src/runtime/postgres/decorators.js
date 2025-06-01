import { PostgresPool } from '@uah/postgres/src/pool.js';
import { signal } from '../process.js';

export function Postgres(ctor, options) {
  ctor.prototype.postgres ??= new PostgresPool({ signal, ...options });
  return ctor.prototype.postgres.options;
}

export function Table(ctor, options) {
  return options;
}
