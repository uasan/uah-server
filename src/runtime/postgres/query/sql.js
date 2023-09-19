import {
  FETCH_ALL,
  FETCH_ONE,
  FETCH_ONE_VALUE,
  TYPE_BLOB,
  TYPE_NATIVE,
} from '@uah/postgres/src/constants.js';

import { concat } from './utils.js';
import { isArray } from '../../types/checker.js';

export class SQL {
  values = [];
  source = [];

  context = null;
  mode = FETCH_ALL | TYPE_NATIVE;

  constructor(source, values, context) {
    this.context = context;

    this.source.push(source[0]);
    concat(this, source, values);
  }

  sql(source, ...values) {
    if (isArray(source)) {
      this.source[this.source.length - 1] += source[0];
      return concat(this, source, values);
    } else {
      this.source[this.source.length - 1] += source;
      return (source, ...values) => concat(this, source, values);
    }
  }

  asObject() {
    this.mode = FETCH_ONE | TYPE_NATIVE;
    return this;
  }

  asValue() {
    this.mode = FETCH_ONE_VALUE | TYPE_NATIVE;
    return this;
  }

  asBlob() {
    this.mode = FETCH_ONE_VALUE | TYPE_BLOB;
    return this;
  }

  then(resolve, reject) {
    this.context.postgres
      .query(this.toString(), this.values, this.mode)
      .then(resolve, reject);
  }

  log() {
    console.log(this.toString(), this.values);
    return this;
  }

  toString() {
    const { source: source } = this;
    let text = source[0];
    for (let i = 1; i < source.length; i++) text += '$' + i + source[i];
    return text;
  }
}

export function sql(strings, ...params) {
  return new SQL(strings, params, this);
}
