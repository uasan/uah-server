import { App, LIBUS_LISTEN_EXCLUSIVE_PORT, us_listen_socket_close } from 'uWebSockets.js';

import { style } from '#utils/console.js';
import { signal } from '../process.js';
import { Router } from './router.js';

export class Server {
  host = '';
  port = 80;

  app = null;
  init = null;
  token = null;
  router = null;
  context = null;
  deferred = null;

  constructor(context, options, preset) {
    const url = new URL(options.url);

    this.host = url.hostname;
    this.port = Number(url.port);

    this.init = options.init;
    this.context = context.prototype;

    this.app = App();
    this.router = new Router(this, url, preset);

    signal.addEventListener('abort', this.destroy.bind(this));
  }

  async start() {
    if (this.deferred) {
      await this.deferred.promise;
    }

    if (this.token) {
      return;
    }

    this.deferred = Promise.withResolvers();

    if (this.init) {
      await this.init(this.context);
    }

    this.app.listen(
      this.host,
      this.port,
      LIBUS_LISTEN_EXCLUSIVE_PORT,
      onListen.bind(this),
    );

    try {
      console.log(await this.deferred.promise);
    } finally {
      this.deferred = null;
    }
  }

  async stop() {
    if (this.deferred) {
      await this.deferred.promise;
    }

    if (this.token) {
      us_listen_socket_close(this.token);
      this.token = null;
    }
  }

  async destroy() {
    await this.stop();

    this.app.close();
    this.app = null;
  }
}

function onListen(token) {
  if (token) {
    this.token = token;
    this.deferred.resolve(`${style.bgGreenBright(style.bold(' LISTEN '))} ${style.blueBright(this.router.url)}\n`);
  } else {
    this.deferred.reject(new Error(`Port ${this.port} in ${this.host} not available for listen`));
  }
}
