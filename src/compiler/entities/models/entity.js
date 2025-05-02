import { PATH_SRC_APP } from '#config';
import { TypeScriptEntity } from '../typescript/entity.js';

export class ModelEntity extends TypeScriptEntity {
  static {
    this.init({ path: PATH_SRC_APP + '*/models/**.ts' });
  }

  model = {
    name: '',
    url: this.url,
  };

  delete() {
    return super.delete();
  }
}
