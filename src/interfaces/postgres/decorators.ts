interface PostgresOptions {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
}

export declare function Postgres(
  options: PostgresOptions
): (target: new () => object, context: ClassDecoratorContext) => void;
