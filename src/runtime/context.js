import { SQL } from '@uah/postgres/src/sql/sql.js';

export class Context {
  sql(strings, ...params) {
    return new SQL(strings, params, this.postgres);
  }
}
