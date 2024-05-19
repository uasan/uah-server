interface CacheOptions {
  maxAge?: number;
  immutable?: boolean;
  revalidate?: () => Promise<boolean>;
}

export declare function Cache(
  options: boolean | number | CacheOptions
): (target: unknown, context: ClassMethodDecoratorContext) => void;
