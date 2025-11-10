import { declarations, entities, host, internalSymbols } from '../host.js';
import { toRelativeURL } from '../helpers/link.js';
import { resolveImportPath } from '../helpers/import.js';
import { getOriginSymbolOfNode, isTypeSymbol } from '../helpers/checker.js';
import { factoryIdentifier } from '../helpers/expression.js';

export function makeImportDeclaration(node) {
  if (node.importClause?.isTypeOnly) return;

  const { imports } = host.module;

  let { importClause } = node;
  let url = node.moduleSpecifier.text;

  if (importClause) {
    const elements = importClause.namedBindings?.elements ?? [];

    if (importClause.name) {
      elements.push(
        host.factory.createImportSpecifier(
          false,
          factoryIdentifier('default'),
          importClause.name,
        ),
      );
    }

    for (let spec of elements) {
      if (!spec.isTypeOnly) {
        const symbol = getOriginSymbolOfNode(spec.name);

        if (isTypeSymbol(symbol)) {
          continue;
        }

        if (declarations.has(symbol)) {
          url = declarations.get(symbol).url;
        } else if (entities.has(resolveImportPath(node))) {
          url = toRelativeURL(
            host.entity.url,
            entities.get(resolveImportPath(node)).url,
          );
        } else if (internalSymbols.has(symbol)) {
          console.log('AAAA');
          continue;
        }

        if (imports.has(url)) {
          imports.get(url).push(spec);
        } else {
          imports.set(url, [spec]);
        }
      }
    }
  } else if (entities.has(resolveImportPath(node))) {
    url = toRelativeURL(
      host.entity.url,
      entities.get(resolveImportPath(node)).url,
    );

    imports.set(url, []);
  }
}
