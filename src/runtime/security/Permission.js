export class Permission {
  rules = [];
  parent = null;

  isParent = false;
  disabled = false;

  constructor({ parent, rules, disabled }) {
    if (parent) {
      this.parent = parent;
      this.isParent = true;
    }
    if (disabled) {
      this.disabled = true;
    }
    this.rules.push(...rules);
  }

  async get(context, payload) {
    if (this.disabled === false && (this.isParent === false || await this.parent.get(context, payload))) {
      for (let i = 0; i < this.rules.length; i++) {
        const rule = this.rules[i];

        if (await rule(context, payload)) {
          return rule;
        }
      }
    }
  }
}

const getName = ({ name }) => name;

class AccessDenied extends Error {
  status = 403;
  expected = nullArray;

  constructor({ rules }) {
    super();
    this.expected = rules.map(getName);
  }
}

export async function Access(context, permission, payload) {
  context.access = await permission.get(context, payload);

  if (!context.access) {
    throw new AccessDenied(permission);
  }
}
