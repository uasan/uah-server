import { noop } from '../utils/native.js';
import { streams } from '../utils/stream.js';

export class BufferStreamReader {
  length = 0;
  offset = 0;
  buffer = null;
  stream = null;
  context = null;
  controller = null;

  resolve = noop;
  reject = noop;

  constructor(res) {
    this.context = res.context;
  }

  onData = (chunk, done) => {
    this.read(chunk, done);
  };

  read(chunk, done) {
    if (chunk.byteLength > 4) {
      this.length = new DataView(chunk).getUint32(0);
      this.buffer = new Uint8Array(this.length);

      this.read = this.readBuffer;
      this.read(chunk.slice(4), done);
    } else {
      this.reject();
    }
  }

  readBuffer(chunk, done) {
    const limit = this.length - this.offset;

    if (chunk.byteLength > limit) {
      this.buffer.set(new Uint8Array(chunk, 0, limit), this.offset);
      this.offset += limit;
    } else {
      this.buffer.set(new Uint8Array(chunk), this.offset);
      this.offset += chunk.byteLength;
    }

    if (this.length === this.offset) {
      this.stream = new ReadableStream({
        type: 'bytes',
        start: controller => {
          this.controller = controller;
        },
      });

      this.context.onAborted = () => {
        this.controller.error(new Error('Abort'));
      };

      this.read = this.readStream;
      streams.set(this.buffer, this);

      if (chunk.byteLength > limit) {
        this.read(chunk.slice(limit), done);
      }

      this.resolve(this.buffer);
    }
  }

  readStream(chunk, done) {
    if (chunk.byteLength) {
      if (this.controller.byobRequest) {
        this.controller.byobRequest.view.set(new Uint8Array(chunk), 0);
        this.controller.byobRequest.respond(chunk.byteLength);
      } else {
        this.controller.enqueue(new Uint8Array(chunk.slice()));
      }
    }

    if (done) {
      this.closeStream();
    }
  }

  closeStream() {
    this.controller.close();
    this.context.onAborted = noop;
  }
}
