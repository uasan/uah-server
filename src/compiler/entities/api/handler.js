import { host } from '../../host.js';
import { internals } from '../../helpers/internals.js';
import {
  factoryStatement,
  factoryTryStatement,
} from '../../helpers/statements.js';
import { factoryCallMethod } from '../../helpers/call.js';
import { factoryConstant } from '../../helpers/var.js';
import { factoryIdentifier, factoryAwait } from '../../helpers/expression.js';
import {
  getAwaitedType,
  getReturnType,
  isVoidLikeType,
} from '../../helpers/checker.js';

export function makeRouteStatements(node) {
  const statements = [];

  const req = factoryIdentifier('req');
  const res = factoryIdentifier('res');
  const ctx = factoryIdentifier('ctx');
  const self = host.factory.createThis();

  const type = getAwaitedType(getReturnType(node));

  //console.log(host.checker.typeToString(type), isVoidLikeType(type));

  let ast = ctx;

  statements.push(
    factoryConstant(ctx, internals.createRequestContext(self, req, res))
  );

  ast = factoryAwait(factoryCallMethod(ast, node.name));

  if (isVoidLikeType(type)) {
    statements.push(
      factoryStatement(ast),
      internals.respondNoContent(res, ctx)
    );
  } else {
    statements.push(internals.respondJson(res, ctx, ast));
  }

  return [
    factoryTryStatement(statements, factoryIdentifier('e'), [
      internals.respondError(res, factoryIdentifier('e')),
    ]),
  ];
}
