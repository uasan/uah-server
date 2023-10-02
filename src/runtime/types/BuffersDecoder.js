const textDecoder = new TextDecoder();

export const BuffersDecoder = {
  offset: 0,
  view: null,
  uint8: null,

  from(uint8) {
    this.offset = 0;
    this.uint8 = uint8;
    this.view = new DataView(uint8.buffer);

    return this;
  },

  getBoolean() {
    return this.uint8[this.offset++] === 1;
  },

  getUint8() {
    return this.uint8[this.offset++];
  },

  getInt8() {
    return this.view.getInt8(this.offset++, true);
  },

  getUint32() {
    this.offset += 4;
    return this.view.getUint32(this.offset - 4, true);
  },

  getUUID() {
    return this.uint8.subarray(this.offset, (this.offset += 16));
  },

  getBuffer() {
    const length = this.view.getInt32(this.offset, true);

    this.offset += 4;

    if (length === -1) return null;
    if (length === -2) return undefined;

    return this.uint8.subarray(this.offset, (this.offset += length));
  },

  getString() {
    const buffer = this.getBuffer();
    return buffer && textDecoder.decode(buffer);
  },

  getJSON() {
    const buffer = this.getBuffer();
    return buffer && JSON.parse(textDecoder.decode(buffer));
  },
};
