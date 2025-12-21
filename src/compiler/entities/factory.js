import { CWD, PATH_NODE_MODULES } from '../../config.js';
import { entities } from '../host.js';

import { AppRouteEntity } from './api/entity.js';
import { LibContextEntity } from './context/entity.js';
import { JsonEntity } from './entity.js';
import { MigrationEntity } from './migrations/entity.js';
import { ModelEntity } from './models/entity.js';
import { SchedulerEntity } from './schedulers/entity.js';
import { TestEntity } from './tests/entity.js';
import { TypeScriptEntity } from './typescript/entity.js';

const classes = [
  TestEntity,
  AppRouteEntity,
  ModelEntity,
  MigrationEntity,
  SchedulerEntity,
  LibContextEntity,
  TypeScriptEntity,
];

export function factoryEntity(path) {
  if (entities.has(path)) {
    return entities.get(path);
  } else if (path.startsWith(CWD) === false) {
    return;
  } else if (path.startsWith(PATH_NODE_MODULES)) {
    return;
  } else {
    for (let i = 0; i < classes.length; i++) {
      if (classes[i].path.test(path)) return new classes[i](path);
    }

    if (path.endsWith('.json')) {
      return new JsonEntity(path);
    }
  }
}
