import { Forbidden } from '../exceptions/Forbidden.js';

export async function Permission(context, rule, payload) {
  if ((await rule(context, payload)) !== true) {
    throw new Forbidden();
  }
}
