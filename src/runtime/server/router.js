import { notImplemented } from './errors.js';
import { respondNoContent } from './response/respondError.js';
import { createWebSocketRPC } from './websocket.js';

export class Router {
  app = null;

  url = '';
  path = '';

  constructor({ app }, { href, pathname }, preset) {
    this.app = app;
    this.url = href;
    this.path = pathname;

    if (pathname.endsWith('/') === false) {
      this.url += '/';
      this.path += '/';
    }

    if (preset) {
      this.url += ':' + preset + '/';
      this.path += ':' + preset + '/';
    }

    app.any('/*', notImplemented);
    app.get('/favicon.ico', respondNoContent);
  }

  set(path, method) {
    this.app[method.name](this.path + path, method);
    return this;
  }

  setWebSocketRPC(path, ctor) {
    this.app.ws(this.path + path, createWebSocketRPC(ctor));
    return this;
  }
}
