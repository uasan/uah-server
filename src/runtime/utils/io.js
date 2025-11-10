import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Buffer } from 'node:buffer';
import { Writable } from 'node:stream';
import { exec } from 'node:child_process';
import { statSync, createWriteStream } from 'node:fs';
import { TransformStream } from 'node:stream/web';
import { open as openFile, rename as moveFile } from 'node:fs/promises';
import { randomUUID, createHash, webcrypto as crypto } from 'node:crypto';

export { env } from 'node:process';

export const getRandomString = length =>
  Buffer.from(crypto.getRandomValues(new Uint8Array(length)))
    .toString('base64url')
    .slice(0, length);

export const IO = {
  openFile,
  moveFile,

  hash: async (algorithm, buffer, encoding) =>
    Buffer.from(await crypto.subtle.digest(algorithm, buffer)).toString(
      encoding,
    ),

  getTempFileName: () => join(tmpdir(), randomUUID()),
  getFileSize: path => statSync(path).size,

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

  exec(command, options) {
    return {
      then(resolve, reject) {
        exec(command, options, (error, stdout) => {
          if (error) reject(error);
          else resolve(stdout);
        });
      },
    };
  },
};
