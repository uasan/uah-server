import type { ServerContext } from '../server/context.ts';

export declare function Permission(
  rule: (context: ServerContext, payload?: any) => Promise<boolean>
): (target: unknown, context: ClassMethodDecoratorContext) => void;
