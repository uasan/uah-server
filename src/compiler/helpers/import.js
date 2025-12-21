import { host } from '../host.js';
import { factoryIdentifier } from './expression.js';

export const resolveImportPath = node =>
  host.program.getResolvedModuleFromModuleSpecifier(
    node.moduleSpecifier,
    host.file,
  )?.resolvedModule?.resolvedFileName;

export const createImportAttributes = type =>
  host.factory.createImportAttributes(
    [
      host.factory.createImportAttribute(
        factoryIdentifier('type'),
        host.factory.createStringLiteral(type),
      ),
    ],
    false,
  );

export const createImportDeclaration = (importClause, url, type) =>
  host.factory.createImportDeclaration(
    undefined,
    importClause,
    host.factory.createStringLiteral(url),
    type ? createImportAttributes(type) : undefined,
  );

export const createImportsOfMap = map => {
  const imports = [];

  for (const [url, elements] of map) {
    imports.push(
      host.factory.createImportDeclaration(
        undefined,
        elements.length
          ? host.factory.createImportClause(
              undefined,
              elements.length === 1 &&
                elements[0].propertyName?.escapedText === 'default'
                ? elements[0].name
                : host.factory.createNamedImports(elements),
              undefined,
            )
          : undefined,
        host.factory.createStringLiteral(url),
        url.endsWith('.json') ? createImportAttributes('json') : undefined,
      ),
    );
  }

  return imports;
};

export const createImportClause = (name, elements) =>
  host.factory.createImportClause(
    undefined,
    name,
    elements?.length && host.factory.createNamedImports(elements),
  );

export const factoryImportSpecifier = (name, propertyName) =>
  host.factory.createImportSpecifier(false, propertyName, name);
