import type { ServerContext } from '../server/context.ts';

export declare function Access(
  rule: (context: ServerContext, payload?: any) => boolean | Promise<boolean>,
): (target: unknown, context: ClassMethodDecoratorContext) => void;
