import { SQL } from '@uah/postgres';

export function sql(strings, ...params) {
  return new SQL(strings, params, this.postgres);
}
