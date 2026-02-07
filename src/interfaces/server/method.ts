interface MethodOptions {
  maxPayloadSize?: number;
}

export declare function Method(
  options: MethodOptions,
): (target: unknown, context: ClassMethodDecoratorContext) => void;
