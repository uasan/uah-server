import { streams } from '../utils/stream.js';
import { File } from './File.js';
import { textDecoder } from './text.js';

export const BuffersDecoder = new (class BuffersDecoder {
  offset = 0;
  view = null;
  uint8 = null;

  from(uint8) {
    this.offset = 0;
    this.uint8 = uint8;
    this.view = new DataView(uint8.buffer);

    return this;
  }

  getBoolean() {
    return this.view.getUint8(this.offset++) === 1;
  }

  getUint8() {
    return this.view.getUint8(this.offset++);
  }

  getInt8() {
    return this.view.getInt8(this.offset++);
  }

  getUint32() {
    this.offset += 4;
    return this.view.getUint32(this.offset - 4);
  }

  getFloat64() {
    this.offset += 8;
    return this.view.getFloat64(this.offset - 8);
  }

  getSlice(length) {
    return this.uint8.subarray(this.offset, (this.offset += length));
  }

  getBuffer() {
    return this.getSlice(this.getUint32());
  }

  getBigInt() {
    this.offset += 8;
    return this.view.getBigInt64(this.offset - 8);
  }

  getString() {
    return textDecoder.decode(this.getBuffer());
  }

  getJSON() {
    return JSON.parse(textDecoder.decode(this.getBuffer()));
  }

  getBlob() {}

  getFile() {
    const file = new File(streams.get(this.uint8).stream);

    file.name = this.getString();
    file.lastModified = this.getFloat64();
    file.type = this.getString();
    file.size = this.getUint32();

    return file;
  }
})();
