import { type PostgresClient, type SQL } from '@uah/postgres';

export declare abstract class Context {
  /** @internal */ postgres: PostgresClient;

  sql(strings: TemplateStringsArray, ...params: any[]): SQL;
}
