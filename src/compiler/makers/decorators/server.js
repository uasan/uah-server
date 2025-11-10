import { makeBinServer, routes } from '#compiler/entities/api/maker.js';
import { makePayloadFromQuery } from '#compiler/entities/api/payload.js';
import { factoryNew } from '#compiler/helpers/call.js';
import {
  getOriginSymbolClass,
  getPropertiesOfType,
  getTypeOfNode,
  isNotUndefinedType,
} from '#compiler/helpers/checker.js';
import { addToStaticProperty } from '#compiler/helpers/class.js';
import {
  factoryIdentifier,
  factoryString,
  factoryThis,
} from '#compiler/helpers/expression.js';
import {
  factoryArrowFunction,
  factoryParameter,
} from '#compiler/helpers/function.js';
import { host, metaSymbols, Unlinks } from '#compiler/host.js';
import { isConstructorDeclaration } from 'typescript';

export function Server(node, original, decor) {
  const entity = host.entity;
  const args = [factoryThis(), decor.arguments[0]];
  const symbol = getOriginSymbolClass(original);
  const preset = original.members?.find(isConstructorDeclaration)
    ?.parameters?.[0];
  const meta = {
    isServer: true,
    url: entity.url,
    countRoutParams: 0,
    relations: new Set(),
    className: original.name?.escapedText,
  };

  if (preset) {
    const type = getTypeOfNode(preset);
    const props = getPropertiesOfType(type).filter(isNotUndefinedType);

    if (props.length) {
      node = addToStaticProperty(
        node,
        factoryIdentifier('getParamsOfRoute'),
        factoryArrowFunction(
          [factoryParameter(factoryIdentifier('req'))],
          makePayloadFromQuery(type).data,
        ),
      );

      meta.countRoutParams = props.length;
      args.push(
        factoryString(props.map(symbol => symbol.escapedName).join('/:')),
      );
    }
  }

  metaSymbols.set(symbol, meta);
  routes.set(symbol, meta.relations);

  entity.unlinks ??= new Unlinks(makeBinServer);
  entity.unlinks.set(symbol, routes);

  return addToStaticProperty(
    node,
    factoryIdentifier('server'),
    factoryNew(decor.expression, args),
  );
}
