import { PATH_SRC_APP } from '#config';
import { TypeScriptEntity } from '../typescript/entity.js';

export class AppRouteEntity extends TypeScriptEntity {
  isRoute = true;

  static {
    this.init({ path: PATH_SRC_APP + '*/api/**.ts' });
  }
}
