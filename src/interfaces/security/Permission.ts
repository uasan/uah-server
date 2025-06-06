type Payload = Record<string, any>;

type RuleAccess = (
  context: any,
  payload: any,
) => boolean | Promise<boolean>;

type Rules = [RuleAccess, ...RuleAccess[]];

interface PermissionOptions {
  rules: Rules;
  parent?: Permission;
  disabled?: boolean;
}

export declare class Permission {
  rules: Rules;
  parent?: Permission;

  isParent: boolean;
  disabled: boolean;

  constructor(options: PermissionOptions);
  get(context: any, payload?: Payload): Promise<RuleAccess>;
}

export declare function Access(
  permission: Permission,
): (target: unknown, context: ClassMethodDecoratorContext) => void;
