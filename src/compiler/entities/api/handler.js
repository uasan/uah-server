import { host } from '../../host.js';
import { internals } from '../../helpers/internals.js';
import { makePayloadFromBody, makePayloadFromQuery } from './payload.js';

import { factoryRouteFunction } from '../../helpers/function.js';
import {
  factoryCallMethod,
  factoryCallThisMethod,
} from '../../helpers/call.js';
import { factoryConstant } from '../../helpers/var.js';
import { getInternalDecorators } from '../../helpers/decorators.js';
import {
  factoryIdentifier,
  factoryAwait,
  factoryAwaitStatement,
  factoryString,
} from '../../helpers/expression.js';
import {
  factoryStatement,
  factoryTryStatement,
} from '../../helpers/statements.js';
import {
  getAwaitedType,
  getReturnType,
  isVoidLikeType,
} from '../../helpers/checker.js';
import { methods } from './constants.js';

export function makeRouteMethod(name, node) {
  const statements = [];

  const req = factoryIdentifier('req');
  const res = factoryIdentifier('res');
  const ctx = factoryIdentifier('ctx');
  const self = host.factory.createThis();

  const decors = getInternalDecorators(node);
  const returnType = getAwaitedType(getReturnType(node));

  let ast = ctx;
  let payload;
  let paramsPath = '';

  statements.push(
    factoryConstant(ctx, factoryCallThisMethod('create', [req, res]))
  );

  if (node.parameters.length) {
    if (name === 'get') {
      payload = factoryIdentifier('data');
      const query = makePayloadFromQuery(node.parameters[0]);

      paramsPath = query.path;
      statements.push(factoryConstant(payload, query.data));
    } else {
      const body = makePayloadFromBody(node.parameters[0]);

      payload = body.data;
      statements.push(factoryConstant(factoryIdentifier('data'), body.init));
    }
  }

  if (decors.get('Permission')?.isPublic !== true) {
    statements.push(factoryAwaitStatement(factoryCallMethod(ctx, 'auth')));
  }

  ast = factoryAwait(factoryCallMethod(ast, name, payload && [payload]));

  if (isVoidLikeType(returnType)) {
    statements.push(
      factoryStatement(ast),
      internals.respondNoContent(res, ctx)
    );
  } else {
    statements.push(internals.respondJson(res, ctx, ast));
  }

  return internals.setRoute(
    methods.get(name),
    factoryString(host.entity.routePath + paramsPath),
    factoryRouteFunction([
      factoryTryStatement(statements, factoryIdentifier('e'), [
        internals.respondError(res, factoryIdentifier('e')),
      ]),
    ])
  );
}
