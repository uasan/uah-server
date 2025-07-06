import { createImportsOfMap } from '../../helpers/import.js';
import { getUrlFromPath } from '../../helpers/link.js';
import { host } from '../../host.js';
import { ModuleScope } from '../../scopes/module.js';
import { printNodes } from '../../worker/printer.js';
import { visit } from '../../worker/visitor.js';
import { Entity } from '../entity.js';

export class TypeScriptEntity extends Entity {
  static {
    this.init({ path: '**.ts' });
  }

  model = null;
  migration = null;

  isTest = false;
  isRoute = false;
  isService = false;
  isContext = false;
  isScheduler = false;

  url = getUrlFromPath(this.path);

  emitting(file) {
    this.unlinks?.purge();

    new ModuleScope(file);
    return file;
  }

  emit(file) {
    return visit(file);
  }

  emitted(file) {
    this.save(
      printNodes(
        host.module.imports.size
          ? [...createImportsOfMap(host.module.imports), ...file.statements]
          : file.statements,
      ),
    );
  }
}
