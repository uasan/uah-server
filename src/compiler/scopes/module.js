//import { IMPORT_NAMES } from '../utils/internals.js';
import { host } from '../host.js';
import { factoryIdentifier } from '../helpers/expression.js';

const PREFIX = '_';

export class ModuleScope {
  constructor(file) {
    host.file = file;
    host.module = this;

    this.sequence = 0;
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
}
