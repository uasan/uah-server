import { factoryAwaitCall } from '../../helpers/call.js';
import { decorMethodStatements } from '../../helpers/decorators.js';
import { factoryAssignPropertyStatement } from '../../helpers/var.js';
import { host } from '../../host.js';

export function Permission(node, original, permission) {
  const self = host.factory.createThis();
  const args = [self];

  if (node.parameters.length) {
    args.push(node.parameters[0].name);
  }

  const ast = factoryAssignPropertyStatement(
    self,
    'permission',
    factoryAwaitCall(permission, args)
  );

  return decorMethodStatements(node, original, [ast]);
}
