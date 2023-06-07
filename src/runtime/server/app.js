import {
  App,
  us_listen_socket_close,
  LIBUS_LISTEN_EXCLUSIVE_PORT,
} from 'uWebSockets.js';

import { signal, abort } from '../process.js';
import { green, red } from '../console/colors.js';

export const Server = {
  url: '',
  host: '',
  port: 0,
  origin: '',
  pathname: '',
  instance: null,

  start(options) {
    this.instance = App();

    const url = new URL(options.url);

    this.url = url.href;
    this.port = +url.port;
    this.origin = url.origin;
    this.host = url.hostname;
    this.pathname = url.pathname;

    this.instance.listen(
      this.host,
      this.port,
      LIBUS_LISTEN_EXCLUSIVE_PORT,
      token => {
        if (token) {
          signal.addEventListener('abort', () => {
            console.log('ON_ABORT');
            us_listen_socket_close(token);
          });
          console.log(green('Server listen on port ') + this.port);

          //abort();
        } else {
          console.error(new Error(red('Server listen on port ' + this.port)));
        }
      }
    );
  },
};
