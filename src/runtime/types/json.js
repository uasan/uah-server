import { BadRequest } from '../exceptions/BadRequest.js';
import { textDecoder } from './text.js';

export const { parse, stringify } = JSON;

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
    return parse(textDecoder.decode(buffer));
  } catch (error) {
    throw new JsonError(error.message);
  }
}

export const stringifyBase64Url = data =>
  Buffer.from(stringify(data)).toString('base64Url');
