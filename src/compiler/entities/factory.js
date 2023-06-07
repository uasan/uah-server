import { CWD, PATH_NODE_MODULES } from '../../config.js';
import { entities } from '../host.js';

import { AppTsEntity } from './typescript/entity.js';

const classes = [AppTsEntity];

export const factoryEntity = path => {
  if (entities.has(path)) {
    return entities.get(path);
  } else if (path.startsWith(CWD) === false) {
    return;
  } else if (path.startsWith(PATH_NODE_MODULES)) {
    return;
  } else {
    for (let i = 0; i < classes.length; i++)
      if (classes[i].path.test(path)) {
        return new classes[i](path);
      }
  }
};
