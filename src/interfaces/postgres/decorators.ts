interface PostgresOptions {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  maxConnections?: number;
}

export declare function Postgres(
  options: PostgresOptions,
): (target: any, context: ClassDecoratorContext) => void;

type Deferrable = 'not' | 'immediate' | 'deferred';
type ReferenceAction =
  | 'noAction'
  | 'cascade'
  | 'setNull'
  | 'restrict'
  | 'setDefault';

interface Reference {
  keys: Record<string, any>;
  onUpdate?: ReferenceAction;
  onDelete?: ReferenceAction;
  deferrable?: Deferrable;
}

interface TableOptions {
  name: string;
  primary: string[];
  unique?: Record<string, string[]>;
  references?: Record<string, Reference>;
  constrains?: Record<string, any>;
  indexes?: Record<string, any>;
}

export declare function Table(
  options: TableOptions,
): (target: new () => object, context: ClassDecoratorContext) => void;
