import { join } from '../utils/concat.js';

export function having(...params) {
  return join(this, '\nHAVING ', params.filter(Boolean), ' AND ');
}
