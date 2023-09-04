interface PostgresOptions {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  maxConnections?: number;
}

export declare function Postgres(
  options: PostgresOptions
): (target: new () => object, context: ClassDecoratorContext) => void;
