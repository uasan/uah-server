import { Context } from '../context.js';
import { TestRunner } from './runner.js';
import { MetaLink, Tree } from './tree.js';

export class TestContext extends Context {
  children = [];
  skipped = false;
  description = '';
  meta = this.constructor.meta;

  static add(url, parents) {
    return new MetaLink(this, url, parents);
  }

  static async run() {
    const runner = new TestRunner(this);

    try {
      await runner.begin(runner);
      await runner.run(Tree.make(this.list));
    } finally {
      await runner.finally();
    }
  }
}
