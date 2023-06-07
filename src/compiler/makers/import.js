import { declarations, entities, host } from '../host.js';
import { toRelativeURL } from '../helpers/link.js';
import {
  resolveImportPath,
  createImportClause,
  createImportDeclaration,
  createImportsOfMap,
} from '../helpers/import.js';
import { getOriginSymbolOfNode } from '../helpers/checker.js';

export const makeImportDeclaration = node => {
  if (node.importClause?.isTypeOnly) return;

  const imports = new Map();
  let { importClause } = node;

  if (importClause) {
    const elements = [];

    for (let spec of importClause.namedBindings?.elements ?? elements) {
      const symbol = getOriginSymbolOfNode(spec.name);

      if (spec.isTypeOnly) {
        continue;
      } else if (declarations.has(symbol)) {
        const { url } = declarations.get(symbol);

        if (imports.has(url)) imports.get(url).push(spec);
        else imports.set(url, [spec]);
      } else {
        elements.push(spec);
      }
    }

    importClause = createImportClause(importClause.name, elements);

    if (elements.length === 0) {
      return imports.size ? createImportsOfMap(imports) : undefined;
    }
  }

  const path = resolveImportPath(node);

  if (entities.has(path)) {
    const url = toRelativeURL(host.entity.url, entities.get(path).url);

    if (url) {
      node = createImportDeclaration(importClause, url);
    } else {
      return;
    }
  }

  if (imports.size) {
    const nodes = createImportsOfMap(imports);
    nodes.push(node);
    return nodes;
  } else {
    return node;
  }
};
