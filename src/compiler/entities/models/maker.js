import { host } from '../../host.js';
import { isExportNode } from '../../helpers/checker.js';

export const models = new Set();

export function makeImportModels() {}

export function TableModel(node) {
  const { route } = host.entity;

  if (!route || !isExportNode(node)) {
    return host.visitEachChild(node);
  }

  node = host.visitEachChild(node);

  return node;
}
