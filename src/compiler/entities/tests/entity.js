import { PATH_SRC_APP } from '#config';
import { TypeScriptEntity } from '../typescript/entity.js';

export class TestEntity extends TypeScriptEntity {
  isTest = true;

  static {
    this.init({ path: PATH_SRC_APP + '*/tests/**.ts' });
  }
}
