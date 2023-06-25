import { transformers } from '../host.js';

export function addTransformer(node, transformer) {
  if (transformers.has(node)) {
    transformers.get(node).add(transformer);
  } else {
    transformers.set(node, new Set().add(transformer));
  }
}
