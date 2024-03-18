import { host } from '../../host.js';
import { internals } from '../../helpers/internals.js';
import { makePayloadFromBody, makePayloadFromQuery } from './payload.js';

import { factoryRouteFunction } from '../../helpers/function.js';
import {
  factoryCall,
  factoryCallMethod,
  factoryCallThisMethod,
} from '../../helpers/call.js';
import { factoryConstant } from '../../helpers/var.js';
import { hasDecorator } from '../../helpers/decorators.js';
import {
  factoryIdentifier,
  factoryAwait,
  factoryAwaitStatement,
  factoryPropertyParenthesized,
} from '../../helpers/expression.js';
import {
  factoryStatement,
  factoryTryStatement,
} from '../../helpers/statements.js';
import {
  getAwaitedType,
  getReturnType,
  getTypeOfNode,
  isVoidLikeType,
  isNotThisParameter,
  isStringType,
  isBigIntType,
  typeToString,
  hasUndefinedType,
  getNonUndefinedType,
} from '../../helpers/checker.js';
import { methods } from './constants.js';
import { makePayloadValidator } from '../../helpers/validator.js';
import { factoryStaticProperty } from '../../helpers/class.js';
import { lookup } from '../../makers/declaration.js';

import { File } from '../../makers/types/validators/File.js';
import { BinaryData } from '../../makers/types/validators/BinaryData.js';

export function makeRouteMethod(name, node) {
  const statements = [];

  const req = factoryIdentifier('req');
  const res = factoryIdentifier('res');
  const ctx = factoryIdentifier('ctx');

  let returnType = getAwaitedType(getReturnType(node));
  let payloadNode = node.parameters.find(isNotThisParameter);
  let payloadType = payloadNode && getTypeOfNode(payloadNode);

  const hasUndefinedReturnType = hasUndefinedType(returnType);

  if (hasUndefinedReturnType) {
    returnType = getNonUndefinedType(returnType);
  }

  let ast = ctx;
  let payload;
  let pathParameters = '';

  statements.push(
    factoryConstant(ctx, factoryCallThisMethod('create', [req, res]))
  );

  if (payloadType) {
    const metaType = makePayloadValidator(node, payloadType);

    if (name === 'get') {
      payload = factoryIdentifier('data');
      const query = makePayloadFromQuery(payloadType);

      pathParameters = query.path;
      statements.push(factoryConstant(payload, query.data));
    } else {
      const body = makePayloadFromBody(metaType);

      payload = body.data;
      statements.push(factoryConstant(factoryIdentifier('data'), body.init));
    }
  }

  if (node.modifiers?.some(hasDecorator, lookup.decorators.Permission)) {
    statements.push(factoryAwaitStatement(factoryCallMethod(ctx, 'auth')));
  }

  ast = factoryAwait(factoryCallMethod(ast, name, payload && [payload]));

  if (isVoidLikeType(returnType)) {
    statements.push(factoryStatement(ast), internals.respondNoContent(res));
  } else if (File.isAssignable(returnType)) {
    statements.push(internals.respondFile(res, ast));
  } else if (BinaryData.isAssignable(returnType) || isStringType(returnType)) {
    statements.push(internals.respondBinary(res, ast));
  } else if (isBigIntType(returnType)) {
    statements.push(
      internals.respondBinary(
        res,
        factoryPropertyParenthesized(
          ast,
          factoryCall(factoryIdentifier('toString')),
          hasUndefinedReturnType
        )
      )
    );
  } else {
    statements.push(internals.respondJson(res, ast));
  }

  host.entity.route.methods.push({
    name: methods.get(name),
    params: pathParameters,
  });

  return factoryStaticProperty(
    factoryIdentifier(methods.get(name)),
    factoryRouteFunction([
      factoryTryStatement(statements, factoryIdentifier('e'), [
        internals.respondError(res, factoryIdentifier('e')),
      ]),
    ])
  );
}
