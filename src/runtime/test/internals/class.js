import { Context } from './context.js';
import { LIST, makeParent, getParentResult } from './tree.js';

export class Test {
  count = 0;
  stack = 0;
  result = null;
  skipped = false;
  index = LIST.push(this);

  constructor(describe, options, assert) {
    this.assert = assert;
    this.describe = describe;
    this.context = options.context;
    this.parent = makeParent(options);

    if (options.skipped) this.skipped = true;
  }

  async run() {
    return await this.assert(
      new Context(this.context),
      getParentResult(this.parent)
    );
  }
}
