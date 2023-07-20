import {
  App,
  us_listen_socket_close,
  LIBUS_LISTEN_EXCLUSIVE_PORT,
} from 'uWebSockets.js';

import { signal } from '../process.js';
import { Router } from './router.js';
import { blue, green, red } from '../console/colors.js';

export const Server = {
  url: '',
  host: '',
  port: 0,
  origin: '',
  pathname: '',
  instance: null,

  maxByteLengthBody: 65_535,

  async start(options) {
    const url = new URL(options.url);

    this.url = url.href;
    this.port = +url.port;
    this.origin = url.origin;
    this.host = url.hostname;
    this.pathname = url.pathname;

    this.instance = App();

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
    const onAbort = () => {
      us_listen_socket_close(token);
      Server.instance.close();
    };

    signal.addEventListener('abort', onAbort);
    console.log(green('Listen ') + blue(Server.url) + '\n');
  } else {
    console.error(new Error(red('Server start ' + Server.url)));
  }
}
