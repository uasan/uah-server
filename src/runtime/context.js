import { SQL } from '@uah/postgres';

export class Context {
  error = null;
  postgres = null;

  sql(strings, ...params) {
    return new SQL(strings, params, this.postgres);
  }

  async startTransaction(action, payload) {
    try {
      await this.postgres.begin();
      const result = await action(this, payload);
      await this.postgres.commit();

      return result;
    } catch (error) {
      await this.postgres.rollback();
      throw error;
    }
  }
}
