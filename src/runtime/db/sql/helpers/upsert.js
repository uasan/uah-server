import { SQL } from '../sql.js';

export function upsert(model, rows, query = new SQL('ON CONFLICT DO NOTHING')) {
  return this.insert(model, rows, query);
}
