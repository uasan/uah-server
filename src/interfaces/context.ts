import { PostgresClient, SQL } from '@uah/postgres';

export declare abstract class Context {
  postgres: PostgresClient;

  sql(strings: TemplateStringsArray, ...params: any[]): SQL;
}
