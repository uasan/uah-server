import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { TransformStream } from 'node:stream/web';
import { randomUUID, createHash } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { open as openFile } from 'node:fs/promises';
import { Buffer } from 'node:buffer';

export const IO = {
  openFile,

  hash: async (algorithm, buffer, encoding) =>
    Buffer.from(await crypto.subtle.digest(algorithm, buffer)).toString(
      encoding
    ),

  getTempFileName: () => join(tmpdir(), randomUUID()),

  createFileWriteStream: (path, options) =>
    Writable.toWeb(createWriteStream(path, options)),

  createHashStream: algorithm => {
    const hash = createHash(algorithm);

    hash.stream = new TransformStream({
      transform(chunk, controller) {
        hash.update(chunk, 'binary');
        controller.enqueue(chunk);
      },
    });

    return hash;
  },
};
