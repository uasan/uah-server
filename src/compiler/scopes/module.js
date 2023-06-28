//import { IMPORT_NAMES } from '../utils/internals.js';
import { host } from '../host.js';
import { factoryIdentifier } from '../helpers/expression.js';
import { factoryImportSpecifier } from '../helpers/import.js';

const PREFIX = '_';

export class ModuleScope {
  constructor(file) {
    host.file = file;
    host.module = this;

    this.sequence = 0;
    this.aliases = new Map();
    this.imports = new Map();
    this.internalImports = new Map();
    this.identifiers = new Set(file.identifiers.keys());
  }

  getUniqueName(prefix) {
    let name = prefix;
    for (let i = 2; this.identifiers.has(name); i++) name = prefix + i;
    this.identifiers.add(name);
    return name;
  }

  createIdentifier(name = PREFIX + ++this.sequence) {
    return factoryIdentifier(this.getUniqueName(name));
  }

  getImportName(url, name) {
    if (this.aliases.has(name)) {
      return this.aliases.get(name);
    }

    if (this.imports.has(url) === false) {
      this.imports.set(url, []);
    }

    const alias = this.getUniqueName(name);

    const sourceName = factoryIdentifier(name);
    const propertyName = name === alias ? undefined : factoryIdentifier(alias);

    this.imports
      .get(url)
      .push(factoryImportSpecifier(sourceName, propertyName));

    if (propertyName) {
      this.aliases.set(name, propertyName);
      return propertyName;
    } else {
      this.aliases.set(name, sourceName);
      return sourceName;
    }
  }
}
