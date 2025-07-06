import { Context } from '../context';

export abstract class TestContext extends Context {
  skipped: boolean = false;
  description: string = '';

  abstract test(parents?: unknown): Promise<unknown>;
}

export type TestParents<T extends Record<string, TestContext>> = {
  readonly [P in keyof T]: Readonly<Awaited<ReturnType<T[P]['test']>>>;
};
