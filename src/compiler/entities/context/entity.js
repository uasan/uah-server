import { PATH_SRC_LIB } from '#config';
import { TypeScriptEntity } from '../typescript/entity.js';

export class LibContextEntity extends TypeScriptEntity {
  isContext = true;

  static {
    this.init({ path: PATH_SRC_LIB + 'context/**.ts' });
  }
}
