import { makeReturning, makeWere } from './query.js';

export function makeDelete(patch, path) {
  patch.queries.push(
    'DELETE FROM ' +
      patch.model.table.name +
      makeWere(patch, path) +
      makeReturning(patch),
  );
}
