import { postgresContexts } from '#runtime/postgres/decorators.js';
import { Reporter } from './reporter.js';

export class TestRunner {
  postgres = null;
  reporter = null;
  results = new Map();

  constructor(context) {
    this.reporter = new Reporter();
    this.postgres = context.postgres;
  }

  async begin() {
    this.postgres = await this.postgres.begin();

    for (const { prototype } of postgresContexts) {
      prototype.postgres = this.postgres;
    }
  }

  async run(tests) {
    this.reporter.start(tests);

    for (const test of tests) {
      try {
        await this.postgres.begin();

        if (test.skipped) {
          this.reporter.skip(test);
          continue;
        }

        this.results.set(test.meta, await test.test(test.meta.getPayload(this.results)));
        this.reporter.pass(test);
      } catch (error) {
        this.reporter.fail(test);
        throw error;
      }

      if (test.children.length) {
        await this.run(test.children);
      }

      await this.postgres.rollback();
    }

    this.reporter.end();
  }

  async finally() {
    for (const context of postgresContexts) {
      context.prototype.postgres = context.postgres;
    }

    await this.postgres.disconnect();
  }
}
