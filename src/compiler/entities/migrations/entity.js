import { DIR_MIGRATIONS, PATH_SRC } from '#config';
import { afterEmit } from '../../host.js';
import { TypeScriptEntity } from '../typescript/entity.js';
import { makeMigrations, migrations } from './maker.js';

export class MigrationEntity extends TypeScriptEntity {
  static {
    this.init({ path: PATH_SRC + DIR_MIGRATIONS + '/*/**.ts' });
  }

  migration = {
    className: '',
    url: this.url,
    isValid: false,
  };

  constructor(path) {
    super(path);
    migrations.set(this.url, this.migration);
  }

  delete() {
    migrations.delete(this.url);
    afterEmit.add(makeMigrations);
    return super.delete();
  }
}
