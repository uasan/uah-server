import { makeInsert } from './internals/insert.js';
import { makeUpdate } from './internals/update.js';
import { makeDelete } from './internals/delete.js';
import { makeQuery } from './internals/query.js';

export class Patch {
  params = [];
  queries = [];

  relations = new Map();

  constructor(context, model, { patch }) {
    this.model = model;
    this.context = context;

    if (patch.add) {
      for (let i = 0; i < patch.add.length; i++) {
        makeInsert(this, patch.add[i]);
      }
    }

    if (patch.set) {
      for (let i = 0; i < patch.set.length; i++) {
        makeUpdate(this, patch.set[i]);
      }
    }

    if (patch.delete) {
      for (let i = 0; i < patch.delete.length; i++) {
        makeDelete(this, patch.delete[i]);
      }
    }
  }

  async execute() {
    //await ctx.postgres.query('BEGIN');

    //console.log(this.queries, this.params);
    const values = await this.context.postgres.query(
      makeQuery(this),
      this.params
    );

    if (this.relations.size) {
      for (const [model, { patch, entries }] of this.relations) {
        for (let i = 0; i < entries.length; i++) entries[i].set(values);

        await new Patch(this.context, model, { patch }).execute();
      }
    }

    //await ctx.postgres.query('ROLLBACK');
  }
}
