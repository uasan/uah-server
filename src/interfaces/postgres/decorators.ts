interface PostgresOptions {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
}

export declare function Postgres(
  options: PostgresOptions
): (target: Function, context: ClassDecoratorContext) => void;
