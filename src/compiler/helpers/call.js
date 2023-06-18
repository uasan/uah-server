import ts from 'typescript';
import { host } from '../host.js';

export const { isCallLikeExpression } = ts;

export const factoryCall = (name, params) =>
  host.factory.createCallExpression(name, undefined, params);

export const factoryCallStatement = (name, params) =>
  host.factory.createExpressionStatement(factoryCall(name, params));

export const factoryAwaitCall = (name, params) =>
  host.factory.createAwaitExpression(factoryCall(name, params));

export const factoryNew = (name, params) =>
  host.factory.createNewExpression(name, undefined, params);

export const factoryCallMethod = (object, name, params) =>
  host.factory.createCallExpression(
    host.factory.createPropertyAccessExpression(object, name),
    undefined,
    params
  );

export const factoryCallMethodStatement = (object, name, params) =>
  host.factory.createExpressionStatement(
    factoryCallMethod(object, name, params)
  );
