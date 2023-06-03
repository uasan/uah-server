import { getParts } from 'uWebSockets.js';
import { makeHandler } from './handler.js';
import { getMethodCast } from './validate.js';
import { assign, parse, noop, idx } from '#utils/native.js';
import { BadRequest } from '#exceptions/BadRequest.js';

export const readBody = context =>
  new Promise((resolve, reject) => {
    let offset = 0;
    const buffer = Buffer.allocUnsafe(context.request.length);

    context.onAborted = reject;
    context.response.onData((chunk, done) => {
      buffer.set(Buffer.from(chunk), offset);
      if (done) {
        context.onAborted = noop;
        resolve(buffer);
      } else {
        offset += chunk.byteLength;
      }
    });
  });

export const makePayload = (routes, name) => {
  const route = routes[name];
  const { params = {} } = route;

  route.parameters = { path: null, query: null, body: null, files: null };

  if (params.path) {
    route.parameters.path = Object.keys(params.path).map((key, index) => ({
      key,
      index: index + 1,
      cast: getMethodCast(params.path[key]),
    }));
  }

  if (params.query) {
    route.parameters.query = Object.keys(params.query).map(key => ({
      key,
      cast: getMethodCast(params.query[key]),
    }));
  }

  if (params.body) {
    route.parameters.body = Object.create(null);

    for (const key of Object.keys(params.body)) {
      route.parameters.body[key] = {
        cast: getMethodCast(params.body[key]),
      };
    }
  }

  if (params.files) {
    route.parameters.body ??= Object.create(null);

    for (const key of Object.keys(params.files)) {
      route.parameters.body[key] = {
        cast: idx,
      };
    }
  }

  return makeHandler(routes, name);
};

export const getPayload = (route, request) => {
  const payload = Object.create(null);
  const { path, query } = route.parameters;

  if (path !== null) {
    for (let i = 0; i < path.length; i++) {
      const { key, index, cast } = path[i];
      payload[key] = cast(request.getParameter(index));
    }
  }

  if (query !== null) {
    for (let i = 0; i < query.length; i++) {
      const { key, cast } = query[i];
      const value = request.getQuery(key);

      if (value !== '') payload[key] = cast(value);
    }
  }

  return payload;
};

export const setPayloadFromBody = (route, context, payload, buffer) => {
  const { type } = context.request;
  const { body } = route.parameters;

  if (type === 'application/json') {
    try {
      assign(payload, parse(buffer.toString()));
    } catch (error) {
      throw BadRequest.of(error);
    }
  } else if (type.startsWith('multipart/form-data')) {
    const parts = getParts(buffer, type);

    if (!parts) {
      throw new BadRequest('Invalid multipart body');
    }

    for (const { name, type, data, filename } of parts)
      if (body[name]) {
        if (filename) {
          const size = data.byteLength;
          const buffer = Buffer.allocUnsafe(size);

          buffer.set(Buffer.from(data));

          payload[name] = { name: filename, type, size, buffer };
        } else {
          payload[name] = body[name].cast(Buffer.from(data).toString());
        }
      }
  } else if (type === 'application/x-www-form-urlencoded') {
    const entries = new URLSearchParams(buffer.toString()).entries();

    for (const [name, value] of entries)
      if (value && body[name]) payload[name] = body[name].cast(value);
  } else {
    throw new BadRequest('Invalid request content-type');
  }
};
