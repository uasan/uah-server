import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';

export const IO = {
  getTempFileName: () => join(tmpdir(), randomUUID()),

  createFileWriteStream: (path, options) =>
    Writable.toWeb(createWriteStream(path, options)),
};
