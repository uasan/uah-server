import { unlink } from 'node:fs/promises';
import { noop } from '../utils/native.js';
import { IO } from '../utils/io.js';

export class File {
  name = '';
  type = '';

  hash = '';
  hashAlgorithm = 'SHA-1';
  hashEncoding = 'base64url';

  size = 0;
  lastModified = 0;

  #stream = null;

  constructor(stream) {
    this.#stream = stream;
  }

  stream() {
    return this.#stream;
  }

  async arrayBuffer() {
    let offset = 0;
    let byteLength = 0;
    let buffer = new ArrayBuffer(this.size);

    const reader = this.#stream.getReader({ mode: 'byob' });

    do {
      ({
        value: { buffer, byteLength },
      } = await reader.read(new Uint8Array(buffer, offset)));

      offset += byteLength;
    } while (this.size > offset);

    reader.releaseLock();

    this.hash = await IO.hash(this.hashAlgorithm, buffer, this.hashEncoding);

    return buffer;
  }

  async text() {
    let text = '';
    let stream = this.#stream.pipeThrough(new TextDecoderStream('utf-8'));

    for await (const chunk of stream) {
      text += chunk;
    }

    return text;
  }

  async save(path = IO.getTempFileName()) {
    const hash = IO.createHashStream(this.hashAlgorithm);

    try {
      await this.#stream
        .pipeThrough(hash.stream)
        .pipeTo(IO.createFileWriteStream(path));

      this.hash = hash.digest(this.hashEncoding);
    } catch (error) {
      await unlink(path).catch(noop);
      throw error;
    }

    return path;
  }
}
