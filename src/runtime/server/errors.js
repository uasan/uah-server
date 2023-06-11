export const notImplemented = (response, request) => {
  response
    .writeStatus('501')
    .writeHeader('cache-control', 'no-store')
    .writeHeader('content-type', 'application/json')
    .end(
      JSON.stringify({
        status: 501,
        errors: [{ message: 'Not Implemented' }],
      })
    );
};

export const errors = {};
