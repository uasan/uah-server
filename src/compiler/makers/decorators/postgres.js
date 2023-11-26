import { factoryCallStatement } from '../../helpers/call.js';
import { addToStaticBlock } from '../../helpers/class.js';
import { host } from '../../host.js';

export function Postgres(node, original, decor) {
  return addToStaticBlock(node, [
    factoryCallStatement(decor.expression, [
      host.factory.createThis(),
      decor.arguments[0],
    ]),
  ]);
}
