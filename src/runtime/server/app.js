import { App, LIBUS_LISTEN_EXCLUSIVE_PORT, us_listen_socket_close } from 'uWebSockets.js';

import { style } from '#utils/console.js';
import { signal } from '../process.js';
import { Router } from './router.js';

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
      onListen,
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
    console.log(
      style.bgGreenBright(style.bold(' LISTEN '))
        + ' '
        + style.blueBright(Server.url)
        + '\n',
    );
  } else {
    console.error(new Error(style.red('Server start ' + Server.url)));
  }
}
