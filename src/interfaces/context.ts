import { PostgresClient, SQL } from '@uah/postgres';

export declare class Context {
  postgres: PostgresClient;

  sql(strings: TemplateStringsArray, ...params: any[]): SQL;
}
