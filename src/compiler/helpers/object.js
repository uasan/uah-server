import { host } from '../host.js';

export const factoryThisChain = (...names) =>
  names.reduce(
    host.factory.createPropertyAccessExpression,
    host.factory.createThis()
  );
