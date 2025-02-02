import { nullObject } from '../types/checker.js';
import { Patch } from './patch/Patch.js';

export class TableModel {
  static relations = nullObject;

  static toSQL({ source }, string) {
    source[source.length - 1] += this.table.name + string;
  }

  static async patch(ctx, payload) {
    return await new Patch(ctx, this, payload).execute();
  }
}
