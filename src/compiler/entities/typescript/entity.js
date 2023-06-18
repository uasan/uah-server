import { Entity } from '../entity.js';
import { visit } from '../../worker/visitor.js';
import { printNodes } from '../../worker/printer.js';
import { host } from '../../host.js';
import { getUrlFromPath } from '../../helpers/link.js';
import { ModuleScope } from '../../scopes/module.js';
import { createImportsOfMap } from '../../helpers/import.js';

export class AppTsEntity extends Entity {
  static {
    this.init({ path: '**.ts' });
  }

  url = getUrlFromPath(this.path);

  emit(file) {
    new ModuleScope(file);
    return visit(file);
  }

  emitted(file) {
    this.save(
      printNodes(
        host.module.imports.size
          ? [...createImportsOfMap(host.module.imports), ...file.statements]
          : file.statements
      )
    );
  }
}
