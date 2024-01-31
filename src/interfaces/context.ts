import { type PostgresClient } from '@uah/postgres';
import { type SQL } from './postgres/sql.ts';

export declare abstract class Context {
  /** @internal */ postgres: PostgresClient;

  sql(strings: TemplateStringsArray, ...params: any[]): SQL;
}
