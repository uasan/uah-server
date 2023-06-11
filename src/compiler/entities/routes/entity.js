import { AppTsEntity } from '../typescript/entity.js';
import { PATH_SRC_APP } from '#config';
import { deleteRoute, addRoute, makeRoutePath } from './maker.js';

export class AppRouteEntity extends AppTsEntity {
  static {
    this.init({ path: PATH_SRC_APP + '*/api/**.ts' });
  }

  routePath = makeRoutePath(this);

  emitting(file) {
    return addRoute(this, file);
  }

  delete() {
    return deleteRoute(super.delete());
  }
}
