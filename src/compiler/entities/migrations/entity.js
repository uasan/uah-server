import { afterEmit } from '../../host.js';
import { PATH_SRC } from '#config';
import { TypeScriptEntity } from '../typescript/entity.js';
import { migrations, makeMigrations } from './maker.js';

export class MigrationEntity extends TypeScriptEntity {
  static {
    this.init({ path: PATH_SRC + 'migrations/*/*/**.ts' });
  }

  migration = {
    className: '',
    url: this.url,
  };

  emitting(file) {
    migrations.add(this.migration);
    afterEmit.add(makeMigrations);
    return super.emitting(file);
  }

  delete() {
    migrations.delete(this.migration);
    afterEmit.add(makeMigrations);
    return super.delete();
  }
}
