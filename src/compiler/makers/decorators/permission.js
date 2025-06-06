import { factoryAwaitCall } from '../../helpers/call.js';
import { decorMethodStatements } from '../../helpers/decorators.js';
import { host } from '../../host.js';

export function Access(node, original, decor) {
  const self = host.factory.createThis();
  const args = [self, decor.arguments[0]];

  if (node.parameters.length) {
    args.push(node.parameters[0].name);
  }

  const ast = factoryAwaitCall(decor.expression, args);
  return decorMethodStatements(node, original, [ast]);
}
