import { RangeNotSatisfiable } from '../../exceptions/RangeNotSatisfiable.js';

export function parseRange(range, contentLength) {
  if (!range) return null;

  let length = contentLength - 1;
  let offset = parseInt(range.slice(range.indexOf('=') + 1)) || 0;
  let finish = parseInt(range.slice(range.indexOf('-') + 1)) || length;

  length = finish - offset + 1;

  if (!length || offset < 0 || length < 1 || length > contentLength) {
    throw new RangeNotSatisfiable();
  }

  return {
    offset,
    length,
    header: `bytes ${offset}-${finish}/${contentLength}`,
  };
}
