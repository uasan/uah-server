import {
  TRANSACTION_ACTIVE,
  TRANSACTION_INACTIVE,
} from '@uah/postgres/src/constants.js';

export async function startTransaction(action, payload) {
  try {
    await this.postgres.query('BEGIN');
    const result = await action(this, payload);

    if (this.postgres.state === TRANSACTION_ACTIVE) {
      await this.postgres.query('COMMIT');
    }

    return result;
  } catch (error) {
    if (this.postgres.state !== TRANSACTION_INACTIVE) {
      await this.postgres.query('ROLLBACK');
    }
    throw error;
  }
}
