export const notImplemented = response => {
  response
    .writeStatus('501')
    .writeHeader('cache-control', 'no-store')
    .writeHeader('content-type', 'application/json')
    .end(
      JSON.stringify({
        status: 501,
        type: 'NotImplemented',
      })
    );
};

export const respondContentTooLarge = response => {
  response
    .writeStatus('413')
    .writeHeader('cache-control', 'no-store')
    .writeHeader('content-type', 'application/json')
    .end(
      JSON.stringify({
        status: 413,
        type: 'ContentTooLarge',
      })
    );
};

export const errors = {};
