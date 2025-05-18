import { makePayloadFromQuery } from '#compiler/entities/api/payload.js';
import { factoryNew } from '#compiler/helpers/call.js';
import {
  getOriginSymbol,
  getOriginSymbolOfNode,
  getPropertiesOfType,
  getTypeOfNode,
  isNotUndefinedType,
} from '#compiler/helpers/checker.js';
import { addToStaticProperty } from '#compiler/helpers/class.js';
import { factoryIdentifier, factoryString } from '#compiler/helpers/expression.js';
import { factoryArrowFunction, factoryParameter } from '#compiler/helpers/function.js';
import { metaSymbols } from '#compiler/host.js';
import { isConstructorDeclaration } from 'typescript';

export function Server(node, original, decor) {
  const args = [...decor.arguments];
  const meta = { countRoutParams: 0 };
  const preset = original.members?.find(isConstructorDeclaration)?.parameters?.[0];

  if (preset) {
    const type = getTypeOfNode(preset);
    const props = getPropertiesOfType(type).filter(isNotUndefinedType);

    if (props.length) {
      node = addToStaticProperty(
        node,
        factoryIdentifier('getParamsOfRoute'),
        factoryArrowFunction([factoryParameter(factoryIdentifier('req'))], makePayloadFromQuery(type).data),
      );

      meta.countRoutParams = props.length;
      args.push(factoryString(props.map(symbol => symbol.escapedName).join('/:')));
    }
  }

  metaSymbols.set(getOriginSymbol(original.symbol), meta);
  return addToStaticProperty(node, factoryIdentifier('server'), factoryNew(decor.expression, args));
}
