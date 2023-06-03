import { objectContaining } from '#utils/assert.js';

export async function expected(data) {
  return objectContaining(await this, data);
}
