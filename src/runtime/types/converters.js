import { UnProcessable } from '../exceptions/UnProcessable.js';

const { parse } = JSON;
const { utf8Slice } = Buffer.prototype;

export function tryParseJson(value) {
  try {
    return value && parse(value);
  } catch {
    return value;
  }
}

export function decodeJSON(buffer) {
  try {
    return parse(utf8Slice.call(buffer));
  } catch (error) {
    throw new UnProcessable(error.message);
  }
}
