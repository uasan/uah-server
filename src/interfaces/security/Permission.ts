import type { ServerContext } from '../server/context.ts';

type Payload = Record<string, any>;
type RuleAccess = (context: ServerContext, payload?: Payload) => boolean | Promise<boolean>;

interface PermissionOptions {
  parent?: Permission;
  rules: RuleAccess[];
}

export declare class Permission {
  parent?: Permission;
  rules: RuleAccess[];

  constructor(options: PermissionOptions);
  check(context: ServerContext, payload?: Payload): Promise<RuleAccess>;
}

export declare function Access(
  permission: Permission,
): (target: unknown, context: ClassMethodDecoratorContext) => void;
