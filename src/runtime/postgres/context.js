import { Pool } from '@uah/postgres/src/pool.js';
import { signal } from '../process.js';

export function initPostgres({ prototype }, options) {
  prototype.postgres = new Pool({ signal, ...options });
}
