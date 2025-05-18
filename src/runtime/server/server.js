import { App, LIBUS_LISTEN_EXCLUSIVE_PORT, us_listen_socket_close } from 'uWebSockets.js';

import { style } from '#utils/console.js';
import { signal } from '../process.js';
import { Router } from './router.js';

export class Server {
  url = '';
  host = '';
  pathname = '';

  port = 80;

  app = null;
  token = null;

  constructor(options, preset) {
    const url = new URL(options.url);

    this.url = url.href;
    this.host = url.hostname;
    this.pathname = url.pathname;
    this.port = Number(url.port);

    if (this.url.endsWith('/') === false) {
      this.url += '/';
      this.pathname += '/';
    }

    if (preset) {
      this.url += ':' + preset + '/';
      this.pathname += ':' + preset + '/';
    }

    signal.addEventListener('abort', this.stop.bind(this));
  }

  async start() {
    this.app = App();

    await Router.init(this);

    this.app.listen(
      this.host,
      this.port,
      LIBUS_LISTEN_EXCLUSIVE_PORT,
      onListen.bind(this),
    );
  }

  async stop() {
    if (this.token) {
      us_listen_socket_close(this.token);
      this.token = null;
    }

    if (this.app) {
      this.app.close();
      this.app = null;
    }
  }
}

function onListen(token) {
  if (token) {
    this.token = token;

    console.log(
      style.bgGreenBright(style.bold(' LISTEN '))
        + ' '
        + style.blueBright(this.url)
        + '\n',
    );
  } else {
    this.app = null;
    console.error(new Error(style.red('Server start ' + this.url)));
  }
}
