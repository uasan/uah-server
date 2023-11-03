import { openSync, read, close } from 'node:fs';
import { parseRange } from '../utils/parseRange.js';

const files = new Map();
const bufferLength = 131072;

class FileSender {
  file = null;
  range = null;
  response = null;
  context = null;

  fd = 0;
  length = 0;
  position = 0;
  bytesRead = 0;
  bufferLength = bufferLength;

  offsetWrite = 0;
  bytesWritten = 0;

  isConnected = true;
  isReadable = false;
  isWritable = false;

  buffer = new Uint8Array(bufferLength);

  constructor(response, file) {
    this.file = file;
    this.response = response;
    this.context = response.context;

    this.write = this.write.bind(this);
    this.onWritable = this.onWritable.bind(this);
    this.onReadFile = this.onReadFile.bind(this);
    this.endRespond = this.endRespond.bind(this);

    if (files.has(file.path)) {
      this.fd = files.get(file.path).fd;
    } else {
      this.fd = openSync(file.path, 'r', 0o444);
      files.set(this.file.path, { fd: this.fd });
    }

    this.range = parseRange(this.context.request.headers.range, file.size);

    if (this.range) {
      this.position = this.range.offset;
      this.length = this.range.length;
    } else {
      this.length = file.size;
    }

    this.readFile();
    this.response.cork(this.sendHeaders.bind(this));
    this.context.onAborted = this.onAborted.bind(this);
  }

  sendHeaders() {
    const { file, context, response } = this;

    if (this.range) {
      response.writeStatus('206');
      response.writeHeader('content-range', this.range.header);
    }

    response.writeHeader('accept-ranges', 'bytes');

    if (file.type) {
      response.writeHeader('content-type', file.type);
    }

    if (file.hash) {
      response.writeHeader('etag', file.hash);
    }

    if (file.lastModified) {
      response.writeHeader(
        'last-modified',
        new Date(file.lastModified).toUTCString()
      );
    }

    if (file.name) {
      response.writeHeader(
        'content-disposition',
        `attachment; filename="${encodeURIComponent(file.name)}"`
      );
    }

    for (let i = 0; i < context.headers.length; i++)
      response.writeHeader(context.headers[i], context.headers[++i]);

    this.isWritable = true;
    response.onWritable(this.onWritable);

    if (this.bytesRead) {
      this.write();
    }
  }

  readFile() {
    read(
      this.fd,
      this.buffer,
      0,
      this.bufferLength,
      this.position,
      this.onReadFile
    );

    this.isReadable = false;
  }

  onReadFile(error, bytesRead) {
    if (this.isConnected) {
      if (bytesRead) {
        this.position += bytesRead;
        this.bytesRead += bytesRead;

        if (this.bytesRead !== this.length) {
          this.isReadable = true;
        } else {
          this.closeFile();
        }

        if (this.isWritable) {
          this.response.cork(this.write);
        }
      } else {
        this.isReadable = false;

        this.closeFile();
        this.response.cork(this.endRespond);

        if (error) {
          console.error(error);
        }
      }
    }
  }

  write() {
    this.isWritable = this.response.tryEnd(
      this.offsetWrite === 0
        ? this.buffer
        : this.buffer.buffer.slice(this.offsetWrite),
      this.length
    )[0];

    if (this.isWritable && this.isReadable) {
      this.offsetWrite = 0;
      this.bytesWritten = this.response.getWriteOffset();

      this.readFile();
    }
  }

  onWritable(offset) {
    this.offsetWrite = offset - this.bytesWritten;
    this.bytesWritten = offset;

    this.write();
    return this.isWritable;
  }

  endRespond() {
    this.response.end();
    this.isConnected = false;
  }

  closeFile() {
    if (this.fd) {
      //close(this.fd);
      this.fd = 0;
    }
  }

  onAborted() {
    this.isConnected = false;
    this.closeFile();
  }
}

export function respondFile(res, file) {
  if (res.context.connected) {
    new FileSender(res, file);
  }
}
