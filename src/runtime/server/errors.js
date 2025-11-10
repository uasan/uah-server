export function notImplemented(response, request) {
  response
    .writeStatus('501')
    .writeHeader('cache-control', 'no-store')
    .writeHeader('content-type', 'application/json')
    .end(
      JSON.stringify({
        status: 501,
        type: 'NotImplemented',
        url: request.getUrl(),
        method: request.getMethod(),
      }),
    );
}

export function respondContentTooLarge(response) {
  response
    .writeStatus('413')
    .writeHeader('cache-control', 'no-store')
    .writeHeader('content-type', 'application/json')
    .end(
      JSON.stringify({
        status: 413,
        type: 'ContentTooLarge',
      }),
    );
}

export const errors = {};
