import { factoryString } from '../../helpers/expression.js';

export const methods = new Map()
  .set('get', factoryString('get'))
  .set('put', factoryString('put'))
  .set('post', factoryString('post'))
  .set('delete', factoryString('del'));
