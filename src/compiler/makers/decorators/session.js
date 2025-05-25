import { factoryCall } from '#compiler/helpers/call.js';
import { addToStaticProperty } from '#compiler/helpers/class.js';
import { factoryIdentifier, factoryThis } from '#compiler/helpers/expression.js';

export function SessionJWT(node, original, decor) {
  return addToStaticProperty(
    node,
    factoryIdentifier('session'),
    factoryCall(decor.expression, [
      factoryThis(),
      decor.arguments[0],
    ]),
  );
}
