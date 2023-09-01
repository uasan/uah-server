import { TypeScriptEntity } from '../typescript/entity.js';
import { PATH_SRC_APP } from '#config';

export class ModelEntity extends TypeScriptEntity {
  static {
    this.init({ path: PATH_SRC_APP + '*/models/**.ts' });
  }

  model = {
    name: '',
  };

  emitting(file) {
    return super.emitting(file);
  }

  delete() {
    return super.delete();
  }
}
