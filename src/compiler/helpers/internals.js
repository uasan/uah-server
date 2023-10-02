import { URL_LIB_RUNTIME } from '../../config.js';
import { host } from '../host.js';
import { factoryIdentifier } from './expression.js';
import { factoryCall, factoryCallStatement, factoryNew } from './call.js';

function getInternalImport(url, name) {
  if (host.module.internalImports.has(url) === false) {
    host.module.internalImports.set(url, new Map());
  } else if (host.module.internalImports.get(url).has(name)) {
    return host.module.internalImports.get(url).get(name);
  }

  const keyUrl = URL_LIB_RUNTIME + url + '.js';
  const keyName = factoryIdentifier(name);
  const propertyName = factoryIdentifier(host.module.getUniqueName(name));

  const spec = host.factory.createImportSpecifier(
    false,
    keyName === propertyName ? undefined : keyName,
    propertyName
  );

  if (host.module.imports.has(keyUrl)) {
    host.module.imports.get(keyUrl).push(spec);
  } else {
    host.module.imports.set(keyUrl, [spec]);
  }

  host.module.internalImports.get(url).set(name, propertyName);
  return propertyName;
}

export const internals = {
  readBody: (...args) =>
    factoryCall(getInternalImport('server/request', 'readBody'), args),

  respondBinary: (...args) =>
    factoryCallStatement(
      getInternalImport('server/response', 'respondBinary'),
      args
    ),

  respondJson: (...args) =>
    factoryCallStatement(
      getInternalImport('server/response', 'respondJson'),
      args
    ),

  respondNoContent: (...args) =>
    factoryCallStatement(
      getInternalImport('server/response', 'respondNoContent'),
      args
    ),

  respondError: (...args) =>
    factoryCall(getInternalImport('server/response', 'respondError'), args),

  tryParseJson: (...args) =>
    factoryCall(getInternalImport('types/json', 'tryParseJson'), args),

  decodeJSON: (...args) =>
    factoryCall(getInternalImport('types/json', 'decodeJSON'), args),

  newValidator: (...args) =>
    factoryNew(getInternalImport('types/validator', 'Validator'), args),

  initPostgres: options =>
    factoryCallStatement(
      getInternalImport('postgres/context', 'initPostgres'),
      [host.factory.createThis(), options]
    ),
};
