import { host } from '../host.js';
import { factoryIdentifier } from './expression.js';

export const resolveImportPath = node =>
  host.file.resolvedModules.get(
    node.moduleSpecifier.text,
    host.file.impliedNodeFormat
  ).resolvedModule?.resolvedFileName;

export const createAssertClause = type =>
  host.factory.createAssertClause(
    [
      host.factory.createAssertEntry(
        factoryIdentifier('type'),
        host.factory.createStringLiteral(type)
      ),
    ],
    false
  );

export const createImportDeclaration = (importClause, url, assert) =>
  host.factory.createImportDeclaration(
    undefined,
    importClause,
    host.factory.createStringLiteral(url),
    assert ? createAssertClause(assert) : undefined
  );

export const createImportsOfMap = map => {
  const imports = [];

  for (const [url, elements] of map) {
    imports.push(
      host.factory.createImportDeclaration(
        undefined,
        host.factory.createImportClause(
          false,
          undefined,
          host.factory.createNamedImports(elements)
        ),
        host.factory.createStringLiteral(url)
      )
    );
  }

  return imports;
};

export const createImportClause = (name, elements) =>
  host.factory.createImportClause(
    false,
    name,
    elements?.length && host.factory.createNamedImports(elements)
  );
