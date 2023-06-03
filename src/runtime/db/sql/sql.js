import { isArray, isFunction, nullArray } from '../../utils/native.js';
import { log } from './methods/log.js';
import { concat, injection, join } from './utils/concat.js';

export class SQL {
  source = [];
  values = [];

  constructor(strings, params = nullArray) {
    if (isArray(strings)) {
      this.source.push(strings[0]);
      for (let i = 0; i < params.length; ) this.set(params[i], strings[++i]);
    } else {
      this.source.push(strings === undefined ? '' : strings);
    }
  }

  set(param, string) {
    const { source, values } = this;
    const index = source.length - 1;

    if (param instanceof SQL) {
      source[index] += param.source[0];

      if (param.values.length) {
        source.push(...param.source.slice(1));
        source[source.length - 1] += string;
        values.push(...param.values);
      } else {
        source[index] += string;
      }
    } else if (isFunction(param)) {
      if (param.tableName) {
        source[index] += param.tableName + string;
      } else {
        throw new Error('Wrong SQL param type function');
      }
    } else if (param === undefined) {
      source[index] += string;
    } else {
      values.push(param);
      source.push(string);
    }
  }

  sql(strings, ...params) {
    if (isArray(strings)) {
      if (params.length) {
        concat(this, strings, params);
      } else {
        injection(this, strings, ', ');
      }
    } else if (strings !== undefined) {
      this.source[this.source.length - 1] += strings;
    }
    return this;
  }

  join(queries, separator = ',', start = '') {
    return join(this, start, queries.filter(Boolean), separator);
  }

  toString() {
    const { source } = this;
    let text = source[0];
    for (let i = 1; i < source.length; i++) text += '$' + i + source[i];
    return text;
  }
}

SQL.prototype.log = log;

export const sql = (strings, ...params) => new SQL(strings, params);
