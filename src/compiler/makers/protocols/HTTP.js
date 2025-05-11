import { makeRouteMethodHTTP as make } from '#compiler/entities/api/handler.js';

export class HTTP {
  static type = null;
  static symbol = null;

  static methods = new Map()
    .set('get', { make, name: 'get' })
    .set('head', { make, name: 'head' })
    .set('put', { make, name: 'put' })
    .set('post', { make, name: 'post' })
    .set('patch', { make, name: 'patch' })
    .set('delete', { make, name: 'del' });
}
