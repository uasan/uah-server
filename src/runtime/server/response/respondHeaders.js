export function respondHeaders(res, ctx) {
  if (ctx.status) {
    res.writeStatus(ctx.status + '');
  }

  for (let i = 0; i < ctx.headers.length; i++)
    res.writeHeader(ctx.headers[i], ctx.headers[++i]);
}
