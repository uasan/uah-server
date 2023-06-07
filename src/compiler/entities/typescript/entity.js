import { Entity } from '../entity.js';
import { visit } from '../../worker/visitor.js';
import { printNodes } from '../../worker/printer.js';
import { host } from '../../host.js';
import { toBuildPath } from '../../helpers/link.js';

export class AppTsEntity extends Entity {
  static {
    this.init({ path: '**.ts' });
  }

  url = toBuildPath(this.path);

  emit(file) {
    host.file = file;
    return visit(file);
  }

  emitted(file) {
    this.save(printNodes(file.statements));
  }
}
