import type { ServerContext } from '../server/context.ts';

export declare function Permission(
  rule: (context: ServerContext, payload?: any) => Promise<boolean>
): (
  target: (payload?: any) => any,
  context: ClassMethodDecoratorContext
) => void;
