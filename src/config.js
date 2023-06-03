import process from 'process';
import { pathToFileURL } from 'url';

export const CWD = process.cwd();
export const CWD_URL = pathToFileURL(CWD).href;

export const LIB_NAME = '@uah/server';

export const SERVER = {
  host: 'localhost',
  port: 80,
  path: '/',
  url: 'http://localhost/',
  origin: 'http://localhost',

  instance: null,
  secure: false,

  set(config) {
    const url = new URL(config.url);

    this.url = url.href;
    this.host = url.hostname;
    this.path = url.pathname;
    this.origin = url.origin;

    this.secure = url.protocol === 'https:';
    this.port = url.port ? +url.port : this.secure ? 443 : 80;

    if (config.proxy) {
      this.proxy = config.proxy;
    }
  },
};

export function initConfig({ pathsBasePath, plugins }) {
  const config = plugins?.find(({ name }) => name === LIB_NAME);

  if (config?.server) {
    SERVER.set(config.server);
  }

  if (config?.bundle) {
    BUNDLE.set(config.bundle);
  }

  LOCATION.root.url = SERVER.path;
  LOCATION.root.path = pathsBasePath + '/';

  LOCATION.src.url = LOCATION.root.url + BUNDLE.source + '/';
  LOCATION.src.path = LOCATION.root.path + LOCATION.src.name + '/';

  LOCATION.app.url = LOCATION.src.url + LOCATION.app.name + '/';
  LOCATION.app.path = LOCATION.src.path + LOCATION.app.name + '/';

  LOCATION.lib.url = LOCATION.src.url + LOCATION.lib.name + '/';
  LOCATION.lib.path = LOCATION.src.path + LOCATION.lib.name + '/';

  LOCATION.dev.url = LOCATION.src.url + LOCATION.dev.name + '/';

  LOCATION.assets.url = LOCATION.src.url + LOCATION.assets.name + '/';
  LOCATION.assets.path = LOCATION.src.path + LOCATION.assets.name + '/';

  LOCATION.runtime.url = LOCATION.src.url;
  LOCATION.runtime.path =
    LOCATION.root.path + 'node_modules/' + LIB_NAME + '/src/runtime/';
}
