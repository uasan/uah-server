import { Server } from './app.js';
import { ContentTooLarge } from '../exceptions/ContentTooLarge.js';
import { LengthRequired } from '../exceptions/LengthRequired.js';

import { BufferStreamReader } from './stream.js';

export function readBody(req, res, maxLength = Server.maxByteLengthBody) {
  let offset = 0;
  let buffer = null;
  let length = +req.getHeader('content-length');

  if (isNaN(length)) {
    throw new LengthRequired();
  }

  if (length > maxLength) {
    throw new ContentTooLarge(maxLength);
  }

  return new Promise((resolve, reject) => {
    res.context.onAborted = reject;

    res.onData((chunk, done) => {
      if (chunk.byteLength === length) {
        resolve(new Uint8Array(chunk.slice(0)));
      } else {
        buffer ??= new Uint8Array(length);
        buffer.set(new Uint8Array(chunk), offset);

        if (done) resolve(buffer);
        else offset += chunk.byteLength;
      }
    });
  });
}

export function readPartStream(req, res) {
  const reader = new BufferStreamReader(res);

  return new Promise((resolve, reject) => {
    reader.resolve = resolve;
    reader.reject = reject;

    res.context.onAborted = reject;

    res.onData(reader.onData);
  });
}
