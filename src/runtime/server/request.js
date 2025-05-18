import { ContentTooLarge } from '../exceptions/ContentTooLarge.js';
import { LengthRequired } from '../exceptions/LengthRequired.js';

import { BufferStreamReader } from './stream.js';

export function readBuffer(req, res, maxLength = 65_535) {
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

    res.onData((chunk, isDone) => {
      if (buffer) {
        buffer.set(new Uint8Array(chunk), offset);

        if (isDone) resolve(buffer);
        else offset += chunk.byteLength;
      } else if (isDone) {
        resolve(new Uint8Array(chunk.slice()));
      } else {
        offset = chunk.byteLength;
        buffer = new Uint8Array(chunk.transfer(length));
      }
    });
  });
}

export function readBufferStream(req, res) {
  const reader = new BufferStreamReader(res);
  const { promise, resolve, reject } = Promise.withResolvers();

  reader.reject = reject;
  reader.resolve = resolve;

  res.context.onAborted = reject;
  res.onData(reader.onData);

  return promise;
}
