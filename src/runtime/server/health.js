import { Context } from './context.js';

const context = Context.prototype;

export const checkHealth = response => {
  response.end(process.env.APP_BUILD_VERSION ?? '');
};

export const checkDatabaseHealth = async response => {
  let isOpen = true;

  response.onAborted(() => {
    isOpen = false;
  });

  try {
    await context.db.unsafe('SELECT 1');
    if (isOpen) response.end();
  } catch (error) {
    if (isOpen) {
      const body = JSON.stringify({
        code: error?.code,
        message: error?.message,
      });

      response.writeStatus('500');
      response.writeHeader('content-type', 'application/json');
      response.end(body);
    }
  }
};
