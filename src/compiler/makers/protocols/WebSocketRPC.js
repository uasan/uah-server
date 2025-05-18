import { makePayloadFromQuery } from '#compiler/entities/api/payload.js';
import { factoryNew } from '#compiler/helpers/call.js';
import { getTypeOfNode, isNotThisParameter } from '#compiler/helpers/checker.js';
import { factoryStaticProperty } from '#compiler/helpers/class.js';
import { factoryIdentifier, factoryStaticToken } from '#compiler/helpers/expression.js';
import { factoryArrowFunction, factoryBodyFunction, factoryParameter } from '#compiler/helpers/function.js';
import { makePayloadValidator } from '#compiler/helpers/validator.js';
import { host } from '#compiler/host.js';
import { HTTP } from './HTTP.js';

function makeOnOpen(route, members, node) {
  const req = factoryIdentifier('req');

  let path = route.path;
  let payloadNode = node.parameters.find(isNotThisParameter);
  let payloadType = payloadNode && getTypeOfNode(payloadNode);

  if (payloadType) {
    makePayloadValidator(node, payloadType);

    const query = makePayloadFromQuery(payloadType, route.meta.countRoutParams);

    path += query.path;

    members.push(factoryStaticProperty(
      factoryIdentifier('getPayload'),
      factoryArrowFunction([factoryParameter(req)], query.data),
    ));
  }

  members.push(factoryStaticProperty(
    factoryIdentifier('sockets'),
    factoryNew(factoryIdentifier('Map')),
  ));

  members.push(factoryStaticProperty(
    factoryIdentifier('users'),
    factoryNew(factoryIdentifier('Map')),
  ));

  route.methods.push(`Router.setWebSocketRPC('${path}', m.${route.class})`);
}

export class WebSocketRPC {
  static type = null;
  static symbol = null;

  static methods = new Map(HTTP.methods)
    .set('onOpen', { make: makeOnOpen });
}
