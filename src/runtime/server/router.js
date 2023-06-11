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

  set(method, path, action) {
    this.instance[method](this.pathname + path, action);
  },
};
