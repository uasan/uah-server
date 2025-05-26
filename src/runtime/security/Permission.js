import { Forbidden } from '../exceptions/Forbidden.js';

export class Permission {
  rules = [];

  parent = null;
  isParent = false;

  constructor({ parent, rules }) {
    if (parent) {
      this.parent = parent;
      this.isParent = true;
    }
    this.rules.push(...rules);
  }

  async check(context, payload) {
    if (this.isParent === false || await this.parent.check(context, payload)) {
      for (let i = 0; i < this.rules.length; i++) {
        const rule = this.rules[i];

        if (await rule(context, payload)) {
          return rule;
        }
      }
    }
  }
}

export async function Access(context, permission, payload) {
  context.access = await permission.check(context, payload);

  if (!context.access) {
    throw new Forbidden();
  }
}
