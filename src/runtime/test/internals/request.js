import { factoryResponse } from './response.js';
import { makeHandler } from '../../server/handler.js';
import { Exception } from '#exceptions/Exception.js';

const factoryError = context => error =>
  factoryResponse(Exception.respond(context, error));

function expected(data) {
  if (data) this.context.expected = data;
  return this;
}

export const factoryRequest = (methods, name) => {
  const route = makeHandler(methods, name);

  return (context, payload = {}) => {
    context = Object.create(context);

    const promise = route
      .method(context, Object.assign(Object.create(null), payload))
      .then(factoryResponse, factoryError(context));

    promise.context = context;
    promise.expected = expected;

    return promise;
  };
};
