import { Server } from './app.js';
import { ContentTooLarge } from '../exceptions/ContentTooLarge.js';
import { LengthRequired } from '../exceptions/LengthRequired.js';

import { BufferStreamReader } from './stream.js';

export function readBuffer(req, res, maxLength = Server.maxByteLengthBody) {
  const length = +req.getHeader('content-length');

  if (isNaN(length)) {
    throw new LengthRequired();
  }

  if (length > maxLength) {
    throw new ContentTooLarge(maxLength);
  }

  return new Promise((resolve, reject) => {
    let offset = 0;
    let buffer = null;
    res.context.onAborted = reject;

    res.onData((chunk, done) => {
      if (chunk.byteLength === length) {
        resolve(new Uint8Array(chunk.transfer()));
      } else if (buffer) {
        buffer.set(new Uint8Array(chunk), offset);

        if (done) resolve(buffer);
        else offset += chunk.byteLength;
      } else {
        offset = chunk.byteLength;
        buffer = new Uint8Array(chunk.transfer(length));
      }
    });
  });
}

export function readBufferStream(req, res) {
  const reader = new BufferStreamReader(res);

  return new Promise((resolve, reject) => {
    reader.resolve = resolve;
    reader.reject = reject;

    res.context.onAborted = reject;

    res.onData(reader.onData);
  });
}
