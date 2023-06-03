import { noop } from '#utils/native.js';
import { makeError } from '../utils/errors.js';
import { SQL } from './sql.js';
import { intl } from './helpers/intl.js';
import { insert } from './helpers/insert.js';
import { upsert } from './helpers/upsert.js';
import { update } from './helpers/update.js';
import { tsQuery } from './helpers/tsQuery.js';
import { records } from './helpers/records.js';
import { blob } from './methods/blob.js';
import { build } from './methods/build.js';
import { where } from './methods/where.js';
import { explain } from './methods/explain.js';
import { groupBy } from './methods/groupBy.js';
import { having } from './methods/having.js';
import { orderBy } from './methods/orderBy.js';
import { paginate } from './methods/paginate.js';
import { expected } from './methods/expected.js';
import { throwIfNotFound } from './methods/throwIfNotFound.js';
import {
  RESULT_ALL,
  RESULT_ONE,
  RESULT_BLOB,
  RESULT_ONE_VALUE,
} from './constants.js';

export class Query extends SQL {
  result = RESULT_ALL;

  constructor(context, strings, params) {
    super(strings, params);
    this.context = context;
  }

  async send() {
    try {
      const query = this.context.db.unsafe(this.toString(), this.values);

      switch (this.result) {
        case RESULT_ALL:
          return await query;
        case RESULT_ONE:
          return (await query)[0];
        case RESULT_BLOB:
          return (await query.raw())[0]?.[0];
        case RESULT_ONE_VALUE:
          return (await query)[0]?.['0'];
      }
      throw new Error('Wrong setting query result');
    } catch (error) {
      throw makeError(error);
    }
  }

  get then() {
    const promise = this.send();
    return (resolve, reject) => promise.then(resolve, reject);
  }

  catch(reject = noop) {
    return this.send().catch(reject);
  }

  overwrite({ source, values }) {
    this.source = source;
    this.values = values;
    return this;
  }

  findOne() {
    this.result = RESULT_ONE;
    return this;
  }

  findOneValue() {
    this.result = RESULT_ONE_VALUE;
    return this;
  }
}

function buildStatic(params, actions) {
  return new Query(this.context).build(params, actions);
}

Query.prototype.blob = blob;
Query.prototype.build = build;
Query.prototype.where = where;
Query.prototype.explain = explain;
Query.prototype.groupBy = groupBy;
Query.prototype.orderBy = orderBy;
Query.prototype.having = having;
Query.prototype.paginate = paginate;
Query.prototype.expected = expected;
Query.prototype.throwIfNotFound = throwIfNotFound;

export const factory = context => {
  const sql = (strings, ...params) => new Query(context, strings, params);

  sql.intl = intl;
  sql.insert = insert;
  sql.upsert = upsert;
  sql.update = update;
  sql.tsQuery = tsQuery;
  sql.records = records;
  sql.build = buildStatic;
  sql.context = context;

  return sql;
};
