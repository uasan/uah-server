import type { Context } from '../context';

export declare abstract class SchedulerContext extends Context {
  readonly priority: number;
  abstract readonly interval: string;

  init(): Promise<void>;
  abstract start(): Promise<void>;
  stop(): Promise<void>;

  static start(): Promise<void>;
  static stop(): Promise<void>;
}
