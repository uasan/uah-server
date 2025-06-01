import { PATH_SRC_APP } from '#config';
import { afterEmit } from '../../host.js';
import { TypeScriptEntity } from '../typescript/entity.js';
import { makeBinServer, routes } from './maker.js';

export class AppRouteEntity extends TypeScriptEntity {
  isRoute = true;

  static {
    this.init({ path: PATH_SRC_APP + '*/api/**.ts' });
  }

  delete() {
    routes.delete(this.route);
    afterEmit.add(makeBinServer);
    return super.delete();
  }
}
