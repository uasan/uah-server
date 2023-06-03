import { NotFound } from '#exceptions/NotFound.js';

export async function throwIfNotFound(message) {
  const response = await this;

  if (response == null) throw new NotFound(message);

  return response;
}
