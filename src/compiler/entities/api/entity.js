import { AppTsEntity } from '../typescript/entity.js';
import { PATH_SRC_APP } from '#config';
import { routes, makeImportRoutes, makeRoutePath } from './maker.js';
import { afterEmit } from '../../host.js';

export class AppRouteEntity extends AppTsEntity {
  static {
    this.init({ path: PATH_SRC_APP + '*/api/**.ts' });
  }

  route = {
    class: '',
    methods: [],
    url: this.url,
    path: makeRoutePath(this),
  };

  emitting(file) {
    afterEmit.add(makeImportRoutes);
    return super.emitting(file);
  }

  delete() {
    routes.delete(this.route);
    afterEmit.add(makeImportRoutes);
    return super.delete();
  }
}
