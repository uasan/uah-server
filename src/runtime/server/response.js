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

export function respondError(res, error) {
  if (error == null) return;

  let status = error.status || 500;

  if (res.context.connected) {
    const type = error.constructor?.name || 'Error';

    res.cork(() => {
      res
        .writeStatus(status + '')
        .writeHeader('cache-control', 'no-store')
        .writeHeader('content-type', 'application/json')
        .end(
          stringify(
            status === 500
              ? { type, status, message: error.message }
              : { type, status, ...error }
          )
        );
    });
  }

  if (status === 500) {
    console.error(error);
  }
}
