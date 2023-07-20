import { addToStaticBlock } from '../../helpers/class.js';
import { internals } from '../../helpers/internals.js';

export function Postgres(node, original, options) {
  return addToStaticBlock(node, [internals.initPostgres(options)]);
}
