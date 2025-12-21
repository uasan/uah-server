import type { SQL } from './postgres/sql.ts';
import type { PostgresClient } from '@uah/postgres';

export declare abstract class Context {
  /** @internal */ postgres: PostgresClient;

  sql(strings: TemplateStringsArray, ...params: any[]): SQL;

  static mock<T extends Context>(
    this: new (
      ...args: any
    ) => T,
    preset?: Partial<T>,
  ): T;
}
