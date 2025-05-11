import { PATH_SRC_APP } from '#config';
import { afterEmit } from '../../host.js';
import { TypeScriptEntity } from '../typescript/entity.js';
import { makeImportRoutes, makeRoutePath, routes } from './maker.js';

export class AppRouteEntity extends TypeScriptEntity {
  static {
    this.init({ path: PATH_SRC_APP + '*/api/**.ts' });
  }

  route = {
    class: '',
    methods: [],
    url: this.url,
    protocol: null,
    path: makeRoutePath(this),
  };

  emitting(file) {
    routes.add(this.route);
    afterEmit.add(makeImportRoutes);
    return super.emitting(file);
  }

  delete() {
    routes.delete(this.route);
    afterEmit.add(makeImportRoutes);
    return super.delete();
  }
}
