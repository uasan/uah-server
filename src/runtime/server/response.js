import { createGzip, gzipSync } from 'zlib';

export function respond() {
  const { response, headers, body } = this;

  if (this.status !== 200) {
    response.writeStatus(this.status + '');
  }

  if (this.type) {
    response.writeHeader(
      'content-type',
      this.type === 'json' ? 'application/json' : this.type
    );
  }

  for (let i = 0; i < headers.length; ) {
    response.writeHeader(headers[i++], headers[i++]);
  }

  if (this.stream !== null) {
    this.stream
      .on('data', chunk => {
        if (this.isAborted === false) {
          response.write(chunk);
        }
      })
      .on('error', error => {
        console.error(error);
        if (this.isAborted === false) {
          response.close();
        }
      })
      .on('close', () => {
        if (this.isAborted === false) {
          response.end();
        }
      });
  } else if (body == null) {
    response.end();
  } else if (body.length > 2000) {
    response.writeHeader('content-encoding', 'gzip');
    response.end(gzipSync(body));
  } else {
    response.end(body);
  }
}

export function respondStream({ stream, type, fileName, compress = false }) {
  this.status = 200;
  this.type = type || 'application/octet-stream';
  this.set('cache-control', 'no-store, no-transform');

  if (fileName) {
    this.set(
      'content-disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`
    );
  }

  if (compress) {
    this.set('content-encoding', 'gzip');
    this.stream = stream.pipe(createGzip());
  } else {
    this.stream = stream;
  }

  return stream;
}
