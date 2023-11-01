export { respondError } from './response/respondError.js';

const { stringify } = JSON;

function sendBlob(res, ctx, data) {
  if (ctx.status) {
    res.writeStatus(ctx.status + '');
  }

  for (let i = 0; i < ctx.headers.length; i++)
    res.writeHeader(ctx.headers[i], ctx.headers[++i]);

  res.end(data);
}

export function respondNoContent(res, ctx) {
  if (ctx.connected) {
    res.cork(() => {
      res.writeStatus((ctx.status || 204) + '');
      res.end();
    });
  }
}

export function respondBinary(res, ctx, data) {
  if (ctx.connected) {
    res.cork(() => {
      sendBlob(res, ctx, data);
    });
  }
}

export function respondJson(res, ctx, data) {
  if (ctx.connected) {
    ctx.headers.push('content-type', 'application/json');

    res.cork(() => {
      sendBlob(res, ctx, stringify({ data }));
    });
  }
}
