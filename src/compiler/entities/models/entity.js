import { TypeScriptEntity } from '../typescript/entity.js';
import { PATH_SRC_APP } from '#config';
import { models, makeImportModels } from './maker.js';
import { afterEmit } from '../../host.js';

export class ModelEntity extends TypeScriptEntity {
  static {
    this.init({ path: PATH_SRC_APP + '*/models/**.ts' });
  }

  model = {
    class: '',
  };

  emitting(file) {
    models.add(this.model);
    afterEmit.add(makeImportModels);
    return super.emitting(file);
  }

  delete() {
    models.delete(this.model);
    afterEmit.add(makeImportModels);
    return super.delete();
  }
}
