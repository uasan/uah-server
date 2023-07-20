import { host } from '../../host.js';

export function TableModel(node) {
  node = host.visitEachChild(node);

  return node;
}
