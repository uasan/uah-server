import { URL_BUILD } from '../../config.js';
import { notImplemented } from './errors.js';

export const Router = {
  instance: null,

  async init({ instance, pathname }) {
    this.instance = instance;
    this.pathname = pathname;

    await import(URL_BUILD + 'api.js');

    instance.any('/*', notImplemented);
  },

  set(path, method) {
    this.instance[method.name](this.pathname + path, method);
  },
};
