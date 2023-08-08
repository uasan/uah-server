interface PostgresOptions {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
}

interface TableOptions {
  name: string;
  primary: [string, ...string[]];
  references?: Record<string, any>;
  constrains?: Record<string, any>;
  indexes?: Record<string, any>;
}

export declare function Postgres(
  options: PostgresOptions
): (target: new ()=>{}, context: ClassDecoratorContext) => void;

export declare function Table(
  options: TableOptions
): (target: new ()=>{}, context: ClassDecoratorContext) => void;
