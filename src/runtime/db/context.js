import { presets } from '#env';
import { quoteLiteral } from './utils/text.js';
import { createClient } from './client.js';
import { factory } from './sql/query.js';

const DB_POOL = Symbol('DB POOL');

function setCustomParams({ db, uid, route, service }, params) {
  let sql = 'SET LOCAL "custom.app"=' + quoteLiteral(presets.app.id);

  if (uid) {
    sql += ';SET LOCAL "custom.uid"=' + quoteLiteral(uid);
  }

  if (route?.name) {
    sql += ';SET LOCAL "custom.action"=' + quoteLiteral(route.name);
  } else if (service?.name) {
    sql += ';SET LOCAL "custom.action"=' + quoteLiteral(service.name);
  }

  if (params) {
    for (const key of Object.keys(params)) {
      const value = params[key];
      if (value != null) {
        sql += `;SET LOCAL "custom.${key}"=`;
        sql +=
          value === true
            ? "'t'"
            : value === false
            ? "'f'"
            : quoteLiteral(value);
      }
    }
  }

  return db.unsafe(sql);
}

async function transaction(action, payload, params) {
  if (this[DB_POOL]) {
    return await this.db.savepoint(async () => {
      await setCustomParams(this, params?.custom);
      return await action(this, payload);
    });
  }

  this[DB_POOL] = this.db;

  try {
    return await this.db.begin(async db => {
      this.db = db;
      await setCustomParams(this, params?.custom);
      return await action(this, payload);
    });
  } finally {
    this.db = this[DB_POOL];
    this[DB_POOL] = null;

    if (this.transactionTasks) {
      for (const action of this.transactionTasks)
        await action(this).catch(console.error);
      this.transactionTasks.clear();
    }
  }
}

function isTransaction() {
  return !!this[DB_POOL];
}

async function runAfterTransaction(action) {
  (this.transactionTasks ??= new Set()).add(action);
}

export const setDataBaseContext = (context, options) => {
  context[DB_POOL] = null;
  context.transaction = transaction;
  context.transactionTasks = null;
  context.isTransaction = isTransaction;
  context.runAfterTransaction = runAfterTransaction;
  context.db = createClient(options);
  context.sql = factory(context);
};
