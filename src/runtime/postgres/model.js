import { nullObject } from '../types/checker.js';
import { Patch } from './patch/Patch.js';

export class TableModel {
  static toSQL() {
    return this.table.name;
  }

  static relations = nullObject;

  static async patch(ctx, payload) {
    return await new Patch(ctx, this, payload).execute();
  }
}
