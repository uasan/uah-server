export function respondError(res, error) {
  if (error == null) return;

  let status = error.status || 500;

  if (res.context?.connected) {
    const type = error.constructor?.name || 'Error';

    res.cork(() => {
      res
        .writeStatus(status + '')
        .writeHeader('cache-control', 'no-store')
        .writeHeader('content-type', 'application/json')
        .end(
          JSON.stringify(
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
