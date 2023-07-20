export declare function Permission(
  rule: () => boolean
): (
  target: (payload?: any) => any,
  context: ClassMethodDecoratorContext
) => void;
