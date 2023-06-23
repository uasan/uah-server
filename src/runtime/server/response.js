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

export function respondJson(res, ctx, data) {
  if (ctx.connected) {
    ctx.headers.push('content-type', 'application/json');

    res.cork(() => {
      sendBlob(res, ctx, stringify({ data }));
    });
  }
}

export function respondError(res, error) {
  if (error == null) return;

  let status = error.status || 500;

  if (res.context.connected) {
    const data = {
      status,
      type: error.constructor?.name || 'Error',
      message: error.message,
      ...error,
    };

    res.cork(() => {
      res.writeStatus(status + '');

      res.writeHeader('cache-control', 'no-store');
      res.writeHeader('content-type', 'application/json');

      res.end(stringify(data));
    });
  }

  if (status === 500) {
    console.error(error);
  }
}
