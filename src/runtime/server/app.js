import {
  App,
  us_listen_socket_close,
  LIBUS_LISTEN_EXCLUSIVE_PORT,
} from 'uWebSockets.js';

import { signal } from '../process.js';
import { Router } from './router.js';
import { connections } from './request.js';
import { blue, green, red } from '../console/colors.js';

export const Server = {
  url: '',
  host: '',
  port: 0,
  origin: '',
  pathname: '',
  instance: App(),

  async start(options) {
    const url = new URL(options.url);

    this.url = url.href;
    this.port = +url.port;
    this.origin = url.origin;
    this.host = url.hostname;
    this.pathname = url.pathname;

    await Router.init(this);

    this.instance.listen(
      this.host,
      this.port,
      LIBUS_LISTEN_EXCLUSIVE_PORT,
      onListen
    );
  },
};

function onListen(token) {
  if (token) {
    signal.addEventListener('abort', () => {
      us_listen_socket_close(token);
      for (const connection of connections) {
        connection.close();
      }
    });
    console.log(green('Server start ') + blue(Server.url) + '\n');
  } else {
    console.error(new Error(red('Server start ' + Server.url)));
  }
}