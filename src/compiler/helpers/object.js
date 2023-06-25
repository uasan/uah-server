import { host } from '../host.js';

export const factoryProperty = (name, value) =>
  host.factory.createPropertyAssignment(name, value);

export const factoryPropertyAccess = (expression, name) =>
  host.factory.createPropertyAccessExpression(expression, name);

export const factoryElementAccess = (expression, name) =>
  host.factory.createElementAccessExpression(expression, name);

export const factoryObjectLiteral = nodes =>
  host.factory.createObjectLiteralExpression(nodes);

export const factoryArrayLiteral = elements =>
  host.factory.createArrayLiteralExpression(elements);

export const factoryThisChain = (...names) =>
  names.reduce(
    host.factory.createPropertyAccessExpression,
    host.factory.createThis()
  );
