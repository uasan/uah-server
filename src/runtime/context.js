import { SQL } from '@uah/postgres';

export class Context {
  error = null;
  postgres = null;

  sql(strings, ...params) {
    return new SQL(strings, params, this.postgres);
  }

  async startTransaction(action, payload) {
    try {
      this.postgres = await this.postgres.begin();
      const result = await action(this, payload);
      this.postgres = await this.postgres.commit();

      return result;
    } catch (error) {
      this.postgres = await this.postgres.rollback();
      throw error;
    }
  }
}
