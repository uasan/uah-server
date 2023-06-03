import { Context } from './context.js';
import { setContext } from './handler.js';
import { authorize } from '#security/auth/authorize.js';
import { Exception } from '#exceptions/Exception.js';
import {
  makePayload,
  getPayload,
  readBody,
  setPayloadFromBody,
} from './payload.js';

export const createContext = (request, response) => {
  const context = new Context();

  response.onAborted(() => {
    context.isAborted = true;
    context.response = null;
    context.onAborted();
  });

  context.path = request.getUrl();
  context.lang = request.getParameter(0);

  context.response = response;
  context.cookies.parse(request.getHeader('cookie'));

  context.request = {
    type: request.getHeader('content-type'),
    length: +request.getHeader('content-length') || 0,
    ip: (
      request.getHeader('x-forwarded-for') ||
      Buffer.from(response.getProxiedRemoteAddressAsText()).toString() ||
      Buffer.from(response.getRemoteAddressAsText()).toString()
    ).split(',')[0],
  };

  return context;
};

const handleRequest = async (route, request, response) => {
  const context = createContext(request, response);

  try {
    setContext(context);
    const payload = getPayload(route, request);

    if (route.isBodyParams) {
      setPayloadFromBody(route, context, payload, await readBody(context));
    }

    await authorize(context, route);
    await route.method(context, payload);
  } catch (error) {
    Exception.respond(context, error);
  }

  if (context.isAborted === false) {
    response.cork(() => {
      context.respond();
    });
  }
};

export const factoryHandler = (routes, name) => {
  const route = makePayload(routes, name);

  return (response, request) => {
    handleRequest(route, request, response);
  };
};
