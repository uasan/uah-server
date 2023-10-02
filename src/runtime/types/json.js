import { BadRequest } from '../exceptions/BadRequest.js';

export const { parse, stringify } = JSON;

const { utf8Slice } = Buffer.prototype;

class JsonError extends BadRequest {}

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
    throw new JsonError(error.message);
  }
}
