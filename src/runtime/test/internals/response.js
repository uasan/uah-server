import { objectContaining } from '#utils/assert.js';

export const factoryResponse = context => {
  const { status, type, expected } = context;

  const isJson = type === 'json';
  const body = isJson ? JSON.parse(context.body) : context.body;

  if (!expected.status) {
    expected.status = status < 300 ? status : 200;
  }

  if (status === expected.status) {
    const response = {
      status,
      type,
      body,
      headers: context.headers,
      data: isJson ? body.data : null,
      meta: isJson ? body.meta : null,
    };
    objectContaining(response, expected);
  } else if (context.error) {
    throw context.error;
  } else {
    objectContaining({ status }, { status: expected.status });
  }

  return isJson ? body.data : body;
};
