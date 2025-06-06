import { internals } from '../../helpers/internals.js';
import { makePayloadFromBody, makePayloadFromQuery } from './payload.js';

import { factoryCall, factoryCallMethod, factoryCallThisMethod } from '../../helpers/call.js';
import {
  getAwaitedType,
  getNonUndefinedType,
  getReturnType,
  getTypeOfNode,
  hasAsyncModifier,
  hasUndefinedType,
  isBigIntType,
  isNotThisParameter,
  isStringType,
  isVoidLikeType,
} from '../../helpers/checker.js';
import { factoryStaticProperty } from '../../helpers/class.js';
import { hasDecorator } from '../../helpers/decorators.js';
import {
  factoryAwait,
  factoryAwaitStatement,
  factoryIdentifier,
  factoryPropertyParenthesized,
  factoryString,
  factoryThis,
} from '../../helpers/expression.js';
import { factoryRouteFunction } from '../../helpers/function.js';
import { factoryTryStatement } from '../../helpers/statements.js';
import { makePayloadValidator } from '../../helpers/validator.js';
import { factoryConstant } from '../../helpers/var.js';
import { lookup } from '../../makers/declaration.js';

import { factoryPropertyAccess } from '#compiler/helpers/object.js';
import { makeCache } from '#compiler/makers/decorators/cache.js';
import { BinaryData } from '../../makers/types/validators/BinaryData.js';
import { File } from '../../makers/types/validators/File.js';

export function makeRouteMethodHTTP(meta, members, node) {
  const statements = [];
  const name = node.name.escapedText;

  const req = factoryIdentifier('req');
  const res = factoryIdentifier('res');
  const ctx = factoryIdentifier('ctx');

  let returnType = getAwaitedType(getReturnType(node));
  let payloadNode = node.parameters.find(isNotThisParameter);
  let payloadType = payloadNode && getTypeOfNode(payloadNode);

  let isAsyncAction = hasAsyncModifier(node);
  let isAsyncHandler = isAsyncAction;

  const isPrivate = node.modifiers?.some(
    hasDecorator,
    lookup.decorators.Access,
  );

  const cache = makeCache(
    node.modifiers?.find(hasDecorator, lookup.decorators.Cache),
    req,
    res,
    ctx,
    isPrivate,
  );

  const hasUndefinedReturnType = hasUndefinedType(returnType);

  if (hasUndefinedReturnType) {
    returnType = getNonUndefinedType(returnType);
  }

  let ast = ctx;
  let payload;
  let pathParameters = '';

  if (cache?.check) {
    statements.push(cache.check);
  }

  statements.push(
    factoryConstant(ctx, factoryCallThisMethod('create', [req, res])),
  );

  if (payloadType) {
    const metaType = makePayloadValidator(node, payloadType);

    if (name === 'get' || name === 'head') {
      payload = factoryIdentifier('data');
      const query = makePayloadFromQuery(payloadType, meta.countRoutParams);

      pathParameters = query.path;
      statements.push(factoryConstant(payload, query.data));
    } else {
      const body = makePayloadFromBody(metaType);
      payload = body.data;
      statements.push(factoryConstant(factoryIdentifier('data'), body.init));
    }
  }

  if (isPrivate) {
    isAsyncHandler = true;
    statements.push(factoryAwaitStatement(factoryCallMethod(ctx, 'auth')));
  }

  ast = factoryCallMethod(ast, name, payload && [payload]);

  if (cache?.preset) {
    statements.push(cache.preset);
  }

  if (isAsyncAction) {
    ast = factoryAwait(ast);
  }

  if (isVoidLikeType(returnType)) {
    ast = internals.respondNoContent(res, ast);
  } else if (File.isAssignable(returnType)) {
    ast = internals.respondFile(res, ast);
  } else if (BinaryData.isAssignable(returnType) || isStringType(returnType)) {
    ast = internals.respondBinary(res, ast);
  } else if (isBigIntType(returnType)) {
    ast = internals.respondBinary(
      res,
      factoryPropertyParenthesized(
        ast,
        factoryCall(factoryIdentifier('toString')),
        hasUndefinedReturnType,
      ),
    );
  } else {
    ast = internals.respondJson(res, ast);
  }

  statements.push(ast);

  members.push(factoryStaticProperty(
    factoryIdentifier(this.name),
    factoryRouteFunction(isAsyncHandler, [
      factoryTryStatement(statements, factoryIdentifier('e'), [
        internals.respondError(res, factoryIdentifier('e')),
      ]),
    ]),
  ));

  meta.setRouteAST('set', [
    factoryString(meta.path + pathParameters),
    factoryPropertyAccess(factoryThis(), name),
  ]);
}
