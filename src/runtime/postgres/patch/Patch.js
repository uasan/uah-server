import { isArray, isObject } from '../../types/checker.js';
import { makeInsert } from './internals/insert.js';
import { makeUpdate } from './internals/update.js';
import { makeDelete } from './internals/delete.js';
import { makeQuery } from './internals/query.js';
import {
  errorNotArray,
  errorNotFound,
  errorNotObject,
} from './internals/errors.js';

export class Patch {
  params = [];
  queries = [];

  returning = [];
  relations = new Map();

  constructor(context, model, { patch }) {
    this.model = model;
    this.context = context;

    if (!isObject(patch)) throw errorNotObject('patch');

    if (patch.delete) {
      if (!isArray(patch.delete)) throw errorNotArray('delete');

      for (let i = 0; i < patch.delete.length; i++) {
        makeDelete(this, patch.delete[i]);
      }
    }

    if (patch.set) {
      if (!isArray(patch.set)) throw errorNotArray('set');

      for (let i = 0; i < patch.set.length; i++) {
        makeUpdate(this, patch.set[i]);
      }
    }

    if (patch.add) {
      if (!isArray(patch.add)) throw errorNotArray('add');

      for (let i = 0; i < patch.add.length; i++) {
        makeInsert(this, patch.add[i]);
      }
    }
  }

  async execute() {
    if (this.queries.length === 0) {
      return;
    }

    //await this.context.postgres.query('BEGIN');

    console.log(makeQuery(this), this.params);

    const values = await this.context.postgres.query(
      makeQuery(this),
      this.params,
    );

    if (this.queries.length > values.length) {
      throw errorNotFound();
    }

    if (this.relations.size) {
      for (const [model, { patch, entries }] of this.relations) {
        for (let i = 0; i < entries.length; i++) entries[i].set(values);

        await new Patch(this.context, model, { patch }).execute();
      }
    }

    //await this.context.postgres.query('ROLLBACK');

    if (this.returning.length) {
      for (let i = 0; i < this.returning.length; i++)
        this.returning[i] = values[i];

      return this.returning;
    }
  }
}
