import { factoryIdentifier, factoryThis } from '#compiler/helpers/expression.js';
import { factoryCall } from '../../helpers/call.js';
import { addToStaticProperty } from '../../helpers/class.js';

export function Postgres(node, original, decor) {
  return addToStaticProperty(
    node,
    factoryIdentifier('postgres'),
    factoryCall(decor.expression, [
      factoryThis(),
      decor.arguments[0],
    ]),
  );
}
