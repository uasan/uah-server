const textDecoder = new TextDecoder();

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

  getString() {
    return textDecoder.decode(this.getBuffer());
  }

  getJSON() {
    return JSON.parse(textDecoder.decode(this.getBuffer()));
  }
})();
