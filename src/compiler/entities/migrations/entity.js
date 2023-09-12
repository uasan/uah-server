import { afterEmit } from '../../host.js';
import { PATH_SRC, DIR_MIGRATIONS } from '#config';
import { TypeScriptEntity } from '../typescript/entity.js';
import { migrations, makeMigrations } from './maker.js';

export class MigrationEntity extends TypeScriptEntity {
  static {
    this.init({ path: PATH_SRC + DIR_MIGRATIONS + '/*/**.ts' });
  }

  migration = {
    url: this.url,
    className: '',
  };

  delete() {
    migrations.delete(this.migration);
    afterEmit.add(makeMigrations);
    return super.delete();
  }
}
